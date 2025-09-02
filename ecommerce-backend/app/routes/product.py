import json
from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File, Form
from typing import List, Optional, Dict, Any
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut, ProductCard, ProductCardList, ProductForCompare
from app.schemas.product_image import ProductImageCreate, ProductImageOut
from app.schemas.tag import TagCreate, TagOut
from app.crud.product_crud import (
    create_product, get_product_by_id, get_products, search_products,
    get_products_by_price_range, get_products_in_stock, update_product,
    delete_product, update_product_stock, add_product_image, get_product_images,
    get_product_primary_image, set_product_image_as_primary, delete_product_image,
    add_tag_to_product, get_product_tags, remove_tag_from_product,
    create_tag, get_tags, get_tag_by_name, get_products_by_tag_id
)
from app.models.product import Product
from app.models.order import Order
from app.models.wishlist_item import WishlistItem
from app.models.cart_item import CartItem
from app.models.product_tag import ProductTag
from app.database import get_db_connection
import random
import logging
from app.models.tag import Tag

router = APIRouter(prefix="/products", tags=["products"])

# Category suggestions endpoint
@router.get("/categories/suggestions")
async def get_category_suggestions(
    query: str = Query(..., description="Category name to search for"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of suggestions")
):
    """Get category suggestions based on existing categories/tags"""
    try:
        from app.models.tag import Tag
        from app.database import get_db_connection
        
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Search for tags that match the query (case-insensitive)
            rows = await conn.fetch("""
                SELECT DISTINCT name, COUNT(*) as usage_count
                FROM tags
                WHERE LOWER(name) LIKE LOWER($1)
                GROUP BY name
                ORDER BY usage_count DESC, name ASC
                LIMIT $2
            """, f"%{query}%", limit)
            
            suggestions = [
                {
                    "name": row["name"],
                    "usage_count": row["usage_count"]
                }
                for row in rows
            ]
            
            return {
                "success": True,
                "suggestions": suggestions,
                "query": query
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting category suggestions: {str(e)}"
        )

# Product routes
@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product_route(product: ProductCreate):
    """Create a new product"""
    try:
        db_product = await create_product(product)
        
        # Handle category/tag assignment
        tags = []
        if product.category:
            try:
                # Add tag to product
                tag_result = await add_tag_to_product(db_product.id, product.category)
                if tag_result:
                    # Get the tag details
                    tag_details = await get_product_tags(db_product.id)
                    tags = tag_details
            except Exception as tag_error:
                print(f"Warning: Could not add tag '{product.category}' to product: {tag_error}")
        
        return ProductOut(
            id=db_product.id,
            name=db_product.name,
            description=db_product.description,
            price=float(db_product.price),
            stock=db_product.stock,
            brand=db_product.brand,
            material=db_product.material,
            colors=json.loads(db_product.colors) if db_product.colors and isinstance(db_product.colors, str) else (db_product.colors or []),
            sizes=json.loads(db_product.sizes) if db_product.sizes and isinstance(db_product.sizes, str) else (db_product.sizes or []),
            care_instructions=db_product.care_instructions,
            features=json.loads(db_product.features) if db_product.features and isinstance(db_product.features, str) else (db_product.features or []),
            specifications=json.loads(db_product.specifications) if db_product.specifications and isinstance(db_product.specifications, str) else (db_product.specifications or {}),
            images=[],
            tags=tags
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not create product: {str(e)}"
        )

@router.get("/", response_model=List[ProductOut])
async def get_products_route(
    search: Optional[str] = Query(None, description="Search products by name"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    in_stock: Optional[bool] = Query(None, description="Only products in stock")
):
    """Get all products with optional filters"""
    if search:
        products = await search_products(search)
    elif min_price is not None and max_price is not None:
        products = await get_products_by_price_range(min_price, max_price)
    elif in_stock:
        products = await get_products_in_stock()
    else:
        products = await get_products()
    
    result = []
    for product in products:
        tags = await get_product_tags(product.id)
        result.append(ProductOut(
            id=product.id,
            name=product.name,
            description=product.description,
            price=float(product.price),
            stock=product.stock,
            brand=product.brand,
            material=product.material,
            colors=json.loads(product.colors) if product.colors and isinstance(product.colors, str) else (product.colors or []),
            sizes=json.loads(product.sizes) if product.sizes and isinstance(product.sizes, str) else (product.sizes or []),
            care_instructions=product.care_instructions,
            features=json.loads(product.features) if product.features and isinstance(product.features, str) else (product.features or []),
            specifications=json.loads(product.specifications) if product.specifications and isinstance(product.specifications, str) else (product.specifications or {}),
            images=[],
            tags=tags
        ))
    return result

# Compare products endpoint
@router.get("/compare", response_model=List[ProductForCompare])
async def get_products_for_compare(
    product_ids: str = Query(..., description="Comma-separated list of product IDs")
):
    """Get products formatted for CompareProducts component"""
    try:
        # Parse product IDs from query parameter
        try:
            ids = [int(id.strip()) for id in product_ids.split(',') if id.strip()]
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid product IDs format. Use comma-separated integers."
            )
        
        if not ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid product IDs provided"
            )
        
        # Get products for comparison
        products_data = await Product.get_products_for_compare(ids)
        
        if not products_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No products found with the provided IDs"
            )
        
        # Convert to ProductForCompare objects
        products = []
        for product_data in products_data:
            product = ProductForCompare(
                id=product_data["id"],
                name=product_data["name"],
                price=float(product_data["price"]),
                original_price=float(product_data["original_price"]),
                image=product_data["image"],
                discount=float(product_data["discount"]),
                rating=float(product_data["rating"]) if product_data["rating"] else None,
                reviews=product_data["reviews"],
                brand=product_data["brand"],
                material=product_data["material"],
                color=product_data["color"],
                size=product_data["size"],
                care=product_data["care"],
                features=product_data["features"],
                inStock=product_data["inStock"]
            )
            products.append(product)
        
        return products
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch products for comparison: {str(e)}"
        )

# New ProductCard endpoints
@router.get("/card", response_model=ProductCardList)
async def get_products_for_card(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Products per page"),
    search: Optional[str] = Query(None, description="Search term"),
    sort: Optional[str] = Query(None, description="Sort field (name, price, rating)"),
    order: Optional[str] = Query(None, description="Sort order (asc, desc)"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price")
):
    """Get products formatted for ProductCard components"""
    try:
        offset = (page - 1) * per_page
        
        # Validate sort parameters
        valid_sort_fields = ['name', 'price', 'rating']
        valid_orders = ['asc', 'desc']
        
        sort_by = sort if sort in valid_sort_fields else 'name'
        sort_order = order if order in valid_orders else 'asc'
        
        # Get total count
        if search:
            total_count = await Product.search_products_count(search, min_price, max_price)
            products_data = await Product.search_products_for_card(
                search, per_page, offset, sort_by, sort_order, min_price, max_price
            )
        else:
            total_count = await Product.get_products_count(min_price, max_price)
            # Use the updated method with filtering support
            products_data = await Product.get_products_for_card(
                per_page, offset, sort_by, sort_order, min_price, max_price
            )
        
        # Convert to ProductCard objects
        products = []
        for product_data in products_data:
            product_card = ProductCard(
                id=product_data["id"],
                name=product_data["name"],
                description=product_data["description"],
                price=float(product_data["price"]),
                stock=product_data["stock"],
                image=product_data["image"],
                discount=float(product_data["discount"]),
                rating=float(product_data["rating"]) if product_data["rating"] else None,
                total_reviews=product_data["total_reviews"]
            )
            products.append(product_card)
        
        return ProductCardList(
            products=products,
            total=total_count,  # Use the actual total count
            page=page,
            per_page=per_page
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {str(e)}")

@router.get("/card/highest-discounts", response_model=List[ProductCard])
async def get_products_with_highest_discounts(limit: int = Query(8, ge=1, le=20)):
    """Get products with highest discount percentages"""
    try:
        products_data = await Product.get_products_with_highest_discounts(limit)
        
        # Convert to ProductCard objects
        products = []
        for product_data in products_data:
            product_card = ProductCard(
                id=product_data["id"],
                name=product_data["name"],
                description=product_data["description"],
                price=float(product_data["price"]),
                stock=product_data["stock"],
                image=product_data["image"],
                discount=float(product_data["discount"]),
                rating=float(product_data["rating"]) if product_data["rating"] else None,
                total_reviews=product_data["total_reviews"]
            )
            products.append(product_card)
        
        return products
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch products with highest discounts: {str(e)}")

@router.get("/card/with-coupons", response_model=List[ProductCard])
async def get_products_with_coupons(limit: int = Query(8, ge=1, le=20)):
    """Get products that have active discounts (since coupons are general)"""
    try:
        products_data = await Product.get_products_with_coupons(limit)
        
        # Convert to ProductCard objects
        products = []
        for product_data in products_data:
            product_card = ProductCard(
                id=product_data["id"],
                name=product_data["name"],
                description=product_data["description"],
                price=float(product_data["price"]),
                stock=product_data["stock"],
                image=product_data["image"],
                discount=float(product_data["discount"]),
                rating=float(product_data["rating"]) if product_data["rating"] else None,
                total_reviews=product_data["total_reviews"]
            )
            products.append(product_card)
        
        return products
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch products with coupons: {str(e)}")

@router.get("/card/best-sellers", response_model=List[ProductCard])
async def get_best_sellers(limit: int = Query(8, ge=1, le=20)):
    """Get selling products based on order count"""
    try:
        products_data = await Product.get_best_sellers(limit)
        
        # Convert to ProductCard objects
        products = []
        for product_data in products_data:
            product_card = ProductCard(
                id=product_data["id"],
                name=product_data["name"],
                description=product_data["description"],
                price=float(product_data["price"]),
                stock=product_data["stock"],
                image=product_data["image"],
                discount=float(product_data["discount"]),
                rating=float(product_data["rating"]) if product_data["rating"] else None,
                total_reviews=product_data["total_reviews"]
            )
            products.append(product_card)
        
        return products
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch best sellers: {str(e)}")

@router.get("/card/{product_id}", response_model=ProductCard)
async def get_product_for_card(product_id: int):
    """Get a single product formatted for ProductCard component, including category (main tag)"""
    try:
        product_data = await Product.get_product_for_card(product_id)
        
        if not product_data:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Convert to ProductCard object
        product_card = ProductCard(
            id=product_data["id"],
            name=product_data["name"],
            description=product_data["description"],
            price=float(product_data["price"]),
            stock=product_data["stock"],
            image=product_data["image"],
            discount=float(product_data["discount"]),
            rating=float(product_data["rating"]) if product_data["rating"] else None,
            total_reviews=product_data["total_reviews"],
            category=product_data.get("category")
        )
        
        return product_card
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch product: {str(e)}")

@router.get("/card/by_tag/{tag_id}", response_model=List[ProductCard])
async def get_products_by_tag_for_card(tag_id: int):
    """Get products by tag formatted for ProductCard components"""
    try:
        # First get products by tag using existing CRUD
        products = await get_products_by_tag_id(tag_id)
        
        # Then get ProductCard data for each product
        product_cards = []
        for product in products:
            product_data = await Product.get_product_for_card(product.id)
            if product_data:
                product_card = ProductCard(
                    id=product_data["id"],
                    name=product_data["name"],
                    description=product_data["description"],
                    price=float(product_data["price"]),
                    stock=product_data["stock"],
                    image=product_data["image"],
                    discount=float(product_data["discount"]),
                    rating=float(product_data["rating"]) if product_data["rating"] else None,
                    total_reviews=product_data["total_reviews"]
                )
                product_cards.append(product_card)
        
        return product_cards
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch products by tag: {str(e)}")

@router.get("/card/featured", response_model=List[ProductCard])
async def get_featured_products_for_card(limit: int = Query(8, ge=1, le=20)):
    """Get featured products for ProductCard components"""
    try:
        products_data = await Product.get_products_for_card(limit, 0)
        
        # Convert to ProductCard objects
        products = []
        for product_data in products_data:
            product_card = ProductCard(
                id=product_data["id"],
                name=product_data["name"],
                description=product_data["description"],
                price=float(product_data["price"]),
                stock=product_data["stock"],
                image=product_data["image"],
                discount=float(product_data["discount"]),
                rating=float(product_data["rating"]) if product_data["rating"] else None,
                total_reviews=product_data["total_reviews"]
            )
            products.append(product_card)
        
        return products
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch featured products: {str(e)}")

@router.get("/search", response_model=List[ProductCard])
async def search_products_for_suggestions(
    q: str = Query(..., description="Search query"),
    limit: int = Query(8, ge=1, le=20, description="Maximum number of results")
):
    """Search products for suggestions - returns ProductCard format"""
    try:
        if not q.strip():
            return []
        
        # Use the existing search method but limit results
        products_data = await Product.search_products_for_card(q.strip(), limit, 0)
        
        # Convert to ProductCard objects
        products = []
        for product_data in products_data:
            product_card = ProductCard(
                id=product_data["id"],
                name=product_data["name"],
                description=product_data["description"],
                price=float(product_data["price"]),
                stock=product_data["stock"],
                image=product_data["image"],
                discount=float(product_data["discount"]),
                rating=float(product_data["rating"]) if product_data["rating"] else None,
                total_reviews=product_data["total_reviews"]
            )
            products.append(product_card)
        
        return products
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search products: {str(e)}")

@router.post("/search/track")
async def track_search_query(
    query: str = Form(...),
    customer_id: int = Form(...),
    has_results: bool = Form(True)
):
    """Track a search query with result status"""
    try:
        from app.models.search_history import SearchHistory
        search_history = await SearchHistory.track_search_query(customer_id, query, has_results)
        return {
            "success": True,
            "message": "Search query tracked successfully",
            "data": search_history.to_dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error tracking search query: {str(e)}")

@router.get("/search/analytics")
async def get_search_analytics(days: int = Query(30, ge=1, le=365)):
    """Get search analytics for the specified number of days"""
    try:
        from app.models.search_history import SearchHistory
        analytics = await SearchHistory.get_search_analytics(days)
        return {
            "success": True,
            "message": "Search analytics retrieved successfully",
            "data": analytics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving search analytics: {str(e)}")

@router.get("/search/unmatched")
async def get_unmatched_searches(limit: int = Query(20, ge=1, le=100)):
    """Get searches that returned no results"""
    try:
        from app.models.search_history import SearchHistory
        searches = await SearchHistory.get_unmatched_searches(limit)
        return {
            "success": True,
            "message": "Unmatched searches retrieved successfully",
            "data": searches
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving unmatched searches: {str(e)}")

@router.get("/for_you/{customer_id}", response_model=List[ProductCard])
async def get_for_you_recommendations(customer_id: int, limit: int = 20):
    """Get personalized product recommendations for a user based on their orders, wishlist, and cart."""
    # 1. Gather all product IDs from orders, wishlist, and cart
    seen_product_ids = set()
    debug_info = {}

    # Orders
    orders = await Order.get_by_customer_id_with_details(customer_id)
    debug_info['orders'] = orders
    for order in orders:
        for item in order.get('items', []):
            seen_product_ids.add(item['product_id'])

    # Wishlist
    wishlist_items = await WishlistItem.get_by_customer_id(customer_id)
    debug_info['wishlist_items'] = [item.product_id for item in wishlist_items]
    for item in wishlist_items:
        seen_product_ids.add(item.product_id)

    # Cart
    from app.models.cart import Cart
    cart = await Cart.get_by_customer_id(customer_id)
    debug_info['cart'] = cart.id if cart else None
    cart_items = []
    if cart:
        cart_items = await CartItem.get_by_cart_id(cart.id)
        debug_info['cart_items'] = [item.product_id for item in cart_items]
        for item in cart_items:
            seen_product_ids.add(item.product_id)
    else:
        debug_info['cart_items'] = []

    debug_info['seen_product_ids'] = list(seen_product_ids)
    print(f"[FOR YOU DEBUG] User {customer_id} - Seen product IDs: {seen_product_ids}")
    print(f"[FOR YOU DEBUG] Orders: {orders}")
    print(f"[FOR YOU DEBUG] Wishlist items: {debug_info['wishlist_items']}")
    print(f"[FOR YOU DEBUG] Cart items: {debug_info['cart_items']}")

    if not seen_product_ids:
        print(f"[FOR YOU DEBUG] No seen products for user {customer_id}, returning empty list.")
        return []  # No recommendations if user has no history

    # 2. Get all unique tag IDs for those products
    tag_ids = set()
    for pid in seen_product_ids:
        tags = await ProductTag.get_tags_for_product(pid)
        print(f"[FOR YOU DEBUG] Product {pid} tags: {tags}")
        for tag in tags:
            if isinstance(tag, dict) and 'id' in tag:
                tag_ids.add(tag['id'])
            elif isinstance(tag, int):
                tag_ids.add(tag)
            elif isinstance(tag, str):
                # Look up tag ID by name
                tag_obj = await Tag.get_by_name(tag)
                if tag_obj:
                    tag_ids.add(tag_obj.id)
    debug_info['tag_ids'] = list(tag_ids)
    print(f"[FOR YOU DEBUG] Tag IDs: {tag_ids}")

    if not tag_ids:
        print(f"[FOR YOU DEBUG] No tag IDs found for user {customer_id}, returning empty list.")
        return []

    # 3. Fetch products from those categories/tags, excluding already seen products
    from app.crud.product_crud import get_products_by_tag_id
    candidate_products = []
    for tag_id in tag_ids:
        products = await get_products_by_tag_id(tag_id)
        print(f"[FOR YOU DEBUG] Products for tag {tag_id}: {[p.id for p in products]}")
        for product in products:
            if product.id not in seen_product_ids:
                candidate_products.append(product)
    debug_info['candidate_products'] = [p.id for p in candidate_products]
    print(f"[FOR YOU DEBUG] Candidate products: {debug_info['candidate_products']}")

    if not candidate_products:
        print(f"[FOR YOU DEBUG] No candidate products for user {customer_id}, returning empty list.")
        return []

    # 4. Pick random recommendations
    import random
    random.shuffle(candidate_products)
    recommended = candidate_products[:limit]
    print(f"[FOR YOU DEBUG] Recommended product IDs: {[p.id for p in recommended]}")

    # 5. Convert to ProductCard format
    from app.models.product import Product
    product_cards = []
    for product in recommended:
        product_data = await Product.get_product_for_card(product.id)
        if product_data:
            product_card = ProductCard(
                id=product_data["id"],
                name=product_data["name"],
                description=product_data["description"],
                price=float(product_data["price"]),
                stock=product_data["stock"],
                image=product_data["image"],
                discount=float(product_data["discount"]),
                rating=float(product_data["rating"]) if product_data["rating"] else None,
                total_reviews=product_data["total_reviews"],
                category=product_data.get("category")
            )
            product_cards.append(product_card)
    print(f"[FOR YOU DEBUG] Final product cards: {[p.id for p in product_cards]}")
    return product_cards

@router.get("/similar/{product_id}", response_model=List[ProductCard])
async def get_similar_products(product_id: int, limit: int = 8):
    """Get similar products based on category, price range, brand, and other attributes."""
    try:
        # Get the current product
        product = await get_product_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Get product tags/categories
        tags = await get_product_tags(product_id)
        tag_ids = []
        for tag in tags:
            if isinstance(tag, dict) and 'id' in tag:
                tag_ids.append(tag['id'])
            elif isinstance(tag, int):
                tag_ids.append(tag)
            elif isinstance(tag, str):
                tag_obj = await Tag.get_by_name(tag)
                if tag_obj:
                    tag_ids.append(tag_obj.id)
        
        # Calculate price range (±30% of current product price)
        price_min = float(product.price) * 0.7
        price_max = float(product.price) * 1.3
        
        # Get products with similar attributes using a scoring system
        similar_products = []
        product_scores = {}
        
        # 1. Same category/tags (highest priority - score 10)
        if tag_ids:
            for tag_id in tag_ids:
                products = await get_products_by_tag_id(tag_id)
                for p in products:
                    if p.id != product_id:
                        if p.id not in product_scores:
                            product_scores[p.id] = {'product': p, 'score': 0}
                        product_scores[p.id]['score'] += 10
        
        # 2. Same brand (score 8)
        if product.brand:
            from app.crud.product_crud import search_products
            brand_products = await search_products(product.brand)
            for p in brand_products:
                if p.id != product_id:
                    if p.id not in product_scores:
                        product_scores[p.id] = {'product': p, 'score': 0}
                    product_scores[p.id]['score'] += 8
        
        # 3. Similar price range (score 5)
        from app.crud.product_crud import get_products_by_price_range
        price_range_products = await get_products_by_price_range(price_min, price_max)
        for p in price_range_products:
            if p.id != product_id:
                if p.id not in product_scores:
                    product_scores[p.id] = {'product': p, 'score': 0}
                product_scores[p.id]['score'] += 5
        
        # 4. Same material (score 3)
        if product.material:
            material_products = await search_products(product.material)
            for p in material_products:
                if p.id != product_id:
                    if p.id not in product_scores:
                        product_scores[p.id] = {'product': p, 'score': 0}
                    product_scores[p.id]['score'] += 3
        
        # Convert to list and sort by score
        similar_products = list(product_scores.values())
        similar_products.sort(key=lambda x: x['score'], reverse=True)
        
        # Take top products and convert to ProductCard format
        top_products = [item['product'] for item in similar_products[:limit]]
        
        product_cards = []
        for p in top_products:
            product_data = await Product.get_product_for_card(p.id)
            if product_data:
                product_card = ProductCard(
                    id=product_data["id"],
                    name=product_data["name"],
                    description=product_data["description"],
                    price=float(product_data["price"]),
                    stock=product_data["stock"],
                    image=product_data["image"],
                    discount=float(product_data["discount"]),
                    rating=float(product_data["rating"]) if product_data["rating"] else None,
                    total_reviews=product_data["total_reviews"],
                    category=product_data.get("category")
                )
                product_cards.append(product_card)
        
        return product_cards
        
    except Exception as e:
        print(f"Error getting similar products: {e}")
        return []

@router.get("/recommendations/price-range", response_model=List[ProductCard])
async def get_price_range_recommendations(
    min_price: float = Query(..., description="Minimum price"),
    max_price: float = Query(..., description="Maximum price"),
    limit: int = Query(8, ge=1, le=20)
):
    """Get product recommendations within a specific price range."""
    try:
        products = await get_products_by_price_range(min_price, max_price)
        
        # Randomize and limit
        import random
        random.shuffle(products)
        products = products[:limit]
        
        product_cards = []
        for product in products:
            product_data = await Product.get_product_for_card(product.id)
            if product_data:
                product_card = ProductCard(
                    id=product_data["id"],
                    name=product_data["name"],
                    description=product_data["description"],
                    price=float(product_data["price"]),
                    stock=product_data["stock"],
                    image=product_data["image"],
                    discount=float(product_data["discount"]),
                    rating=float(product_data["rating"]) if product_data["rating"] else None,
                    total_reviews=product_data["total_reviews"],
                    category=product_data.get("category")
                )
                product_cards.append(product_card)
        
        return product_cards
        
    except Exception as e:
        print(f"Error getting price range recommendations: {e}")
        return []

@router.get("/recommendations/category/{category_name}", response_model=List[ProductCard])
async def get_category_recommendations(
    category_name: str,
    limit: int = Query(8, ge=1, le=20)
):
    """Get product recommendations from a specific category."""
    try:
        # Find tag by name
        tag = await Tag.get_by_name(category_name)
        if not tag:
            return []
        
        # Get products by tag
        products = await get_products_by_tag_id(tag.id)
        
        # Randomize and limit
        import random
        random.shuffle(products)
        products = products[:limit]
        
        product_cards = []
        for product in products:
            product_data = await Product.get_product_for_card(product.id)
            if product_data:
                product_card = ProductCard(
                    id=product_data["id"],
                    name=product_data["name"],
                    description=product_data["description"],
                    price=float(product_data["price"]),
                    stock=product_data["stock"],
                    image=product_data["image"],
                    discount=float(product_data["discount"]),
                    rating=float(product_data["rating"]) if product_data["rating"] else None,
                    total_reviews=product_data["total_reviews"],
                    category=product_data.get("category")
                )
                product_cards.append(product_card)
        
        return product_cards
        
    except Exception as e:
        print(f"Error getting category recommendations: {e}")
        return []

@router.get("/recommendations/trending", response_model=List[ProductCard])
async def get_trending_recommendations(limit: int = Query(8, ge=1, le=20)):
    """Get trending product recommendations based on recent orders and views."""
    try:
        # This could be enhanced with actual analytics data
        # For now, return products with highest discounts or best ratings
        from app.crud.product_crud import get_products_with_highest_discounts
        products = await get_products_with_highest_discounts(limit)
        
        product_cards = []
        for product in products:
            product_data = await Product.get_product_for_card(product.id)
            if product_data:
                product_card = ProductCard(
                    id=product_data["id"],
                    name=product_data["name"],
                    description=product_data["description"],
                    price=float(product_data["price"]),
                    stock=product_data["stock"],
                    image=product_data["image"],
                    discount=float(product_data["discount"]),
                    rating=float(product_data["rating"]) if product_data["rating"] else None,
                    total_reviews=product_data["total_reviews"],
                    category=product_data.get("category")
                )
                product_cards.append(product_card)
        
        return product_cards
        
    except Exception as e:
        print(f"Error getting trending recommendations: {e}")
        return []

@router.get("/trending")
async def get_trending_products(limit: int = Query(12, ge=1, le=50)):
    """Get trending products based on recent orders and popularity"""
    try:
        products = await Product.get_trending_products(limit)
        return {
            "success": True,
            "message": "Trending products retrieved successfully",
            "data": products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving trending products: {str(e)}")

@router.get("/{product_id}", response_model=ProductOut)
async def get_product_route(product_id: int):
    """Get product by ID"""
    try:
        product = await get_product_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Get images and tags
        images = await get_product_images(product_id)
        tags = await get_product_tags(product_id)
        
        # Get average rating and review count
        from app.models.review import Review
        try:
            average_rating = await Review.get_product_average_rating(product_id)
            review_count = await Review.get_product_rating_count(product_id)
        except Exception as e:
            print(f"Error getting review data: {e}")
            average_rating = 0.0
            review_count = 0
        
        # Get active discount
        from app.models.discount import Discount
        try:
            active_discount = await Discount.get_active_discount_by_product(product_id)
            discount_value = 0.0
            if active_discount:
                if active_discount.discount_type == "percentage":
                    discount_value = float(active_discount.value) / 100.0
                else:
                    # For fixed discount, calculate as percentage of price
                    if product.price > 0:
                        discount_value = min(float(active_discount.value) / product.price, 0.99)
                    else:
                        discount_value = 0.0
        except Exception as e:
            print(f"Error getting discount data: {e}")
            discount_value = 0.0
        
        return ProductOut(
            id=product.id,
            name=product.name,
            description=product.description,
            price=float(product.price),
            stock=product.stock,
            brand=product.brand,
            material=product.material,
            colors=json.loads(product.colors) if product.colors and isinstance(product.colors, str) else (product.colors or []),
            sizes=json.loads(product.sizes) if product.sizes and isinstance(product.sizes, str) else (product.sizes or []),
            care_instructions=product.care_instructions,
            features=json.loads(product.features) if product.features and isinstance(product.features, str) else (product.features or []),
            specifications=json.loads(product.specifications) if product.specifications and isinstance(product.specifications, str) else (product.specifications or {}),
            images=[
                ProductImageOut(
                    id=img.id,
                    product_id=img.product_id,
                    image_url=img.image_url,
                    is_primary=img.is_primary
                ) for img in images
            ],
            tags=tags,
            rating=average_rating,
            reviews=review_count,
            discount=discount_value
        )
    except Exception as e:
        print(f"Error in get_product_route: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.put("/{product_id}", response_model=ProductOut)
async def update_product_route(product_id: int, product_data: ProductUpdate):
    """Update product"""
    product = await update_product(product_id, product_data)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return ProductOut(
        id=product.id,
        name=product.name,
        description=product.description,
        price=float(product.price),
        stock=product.stock,
        images=[],
        tags=[]
    )

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product_route(product_id: int):
    """Delete product"""
    success = await delete_product(product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

@router.patch("/{product_id}/stock", response_model=ProductOut)
async def update_product_stock_route(product_id: int, quantity: int):
    """Update product stock"""
    product = await update_product_stock(product_id, quantity)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return ProductOut(
        id=product.id,
        name=product.name,
        description=product.description,
        price=float(product.price),
        stock=product.stock,
        images=[],
        tags=[]
    )

# Product Image routes
@router.post("/{product_id}/images", response_model=ProductImageOut, status_code=status.HTTP_201_CREATED)
async def add_product_image_route(product_id: int, image_data: ProductImageCreate):
    """Add image to product"""
    if image_data.product_id != product_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product ID mismatch"
        )
    
    image = await add_product_image(image_data)
    return ProductImageOut(
        id=image.id,
        product_id=image.product_id,
        image_url=image.image_url,
        is_primary=image.is_primary
    )

@router.get("/{product_id}/images", response_model=List[ProductImageOut])
async def get_product_images_route(product_id: int):
    """Get all images for a product"""
    images = await get_product_images(product_id)
    return [
        ProductImageOut(
            id=img.id,
            product_id=img.product_id,
            image_url=img.image_url,
            is_primary=img.is_primary
        ) for img in images
    ]

@router.patch("/images/{image_id}/primary", response_model=ProductImageOut)
async def set_image_as_primary_route(image_id: int):
    """Set image as primary for product"""
    image = await set_product_image_as_primary(image_id)
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    return ProductImageOut(
        id=image.id,
        product_id=image.product_id,
        image_url=image.image_url,
        is_primary=image.is_primary
    )

@router.delete("/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product_image_route(image_id: int):
    """Delete product image"""
    success = await delete_product_image(image_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )

# Product Tag routes
@router.post("/{product_id}/tags/{tag_name}", status_code=status.HTTP_201_CREATED)
async def add_tag_to_product_route(product_id: int, tag_name: str):
    """Add tag to product"""
    result = await add_tag_to_product(product_id, tag_name)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not add tag to product"
        )
    return {"message": f"Tag '{tag_name}' added to product"}

@router.get("/{product_id}/tags", response_model=List[str])
async def get_product_tags_route(product_id: int):
    """Get tags for a product"""
    return await get_product_tags(product_id)

@router.delete("/{product_id}/tags/{tag_name}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_tag_from_product_route(product_id: int, tag_name: str):
    """Remove tag from product"""
    success = await remove_tag_from_product(product_id, tag_name)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found on product"
        )

# Tag routes
@router.post("/tags", response_model=TagOut, status_code=status.HTTP_201_CREATED)
async def create_tag_route(tag: TagCreate):
    """Create a new tag"""
    try:
        db_tag = await create_tag(tag.name, tag.parent_id)
        return TagOut(
            id=db_tag.id,
            name=db_tag.tag_name,
            parent_id=db_tag.parent_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not create tag: {str(e)}"
        )

@router.get("/tags", response_model=List[TagOut])
async def get_tags_route():
    """Get all tags"""
    tags = await get_tags()
    return [
        TagOut(
            id=tag.id,
            name=tag.tag_name,
            parent_id=tag.parent_id
        ) for tag in tags
    ]

@router.get("/tags/tree", response_model=List[Dict[str, Any]])
async def get_tags_tree_route():
    """Get all tags as a nested tree structure"""
    tags = await get_tags()
    tag_map = {tag.id: {"id": tag.id, "name": tag.tag_name, "parent_id": tag.parent_id, "children": []} for tag in tags}
    tree = []
    for tag in tag_map.values():
        if tag["parent_id"]:
            parent = tag_map.get(tag["parent_id"])
            if parent:
                parent["children"].append(tag)
            else:
                tree.append(tag)  # Orphaned node
        else:
            tree.append(tag)
    return tree

@router.get("/by_tag/{tag_id}", response_model=List[ProductOut])
async def get_products_by_tag_route(tag_id: int):
    """Get all products for a given tag (category)"""
    products = await get_products_by_tag_id(tag_id)
    return [
        ProductOut(
            id=product.id,
            name=product.name,
            description=product.description,
            price=float(product.price),
            stock=product.stock,
            images=[],  # Add images if needed
            tags=[]     # Add tags if needed
        ) for product in products
    ] 

@router.get("/{product_id}/frequently-bought-together")
async def get_frequently_bought_together(product_id: int, limit: int = Query(4, ge=1, le=10)):
    """Get products frequently bought together with the given product"""
    try:
        products = await Product.get_frequently_bought_together(product_id, limit)
        return {
            "success": True,
            "message": "Frequently bought together products retrieved successfully",
            "data": products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving frequently bought together products: {str(e)}")

@router.get("/{product_id}/similar")
async def get_similar_products(product_id: int, limit: int = Query(4, ge=1, le=10)):
    """Get similar products based on category, price range, and tags"""
    try:
        products = await Product.get_similar_products(product_id, limit)
        return {
            "success": True,
            "message": "Similar products retrieved successfully",
            "data": products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving similar products: {str(e)}")

@router.get("/recommendations/customer/{customer_id}")
async def get_customer_recommendations(customer_id: int, limit: int = Query(12, ge=1, le=50)):
    """Get personalized product recommendations for a customer"""
    try:
        products = await Product.get_customer_recommendations(customer_id, limit)
        return {
            "success": True,
            "message": "Customer recommendations retrieved successfully",
            "data": products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving customer recommendations: {str(e)}")

@router.get("/recommendations/guest")
async def get_guest_recommendations(limit: int = Query(12, ge=1, le=50)):
    """Get general product recommendations for guest users"""
    try:
        # Get popular products with high ratings
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT DISTINCT
                    p.id,
                    p.name,
                    p.price,
                    p.description,
                    COALESCE(pi.image_url, 'https://via.placeholder.com/100x100?text=No+Image') as image,
                    p.stock,
                    p.average_rating as rating,
                    p.brand,
                    p.material,
                    COALESCE(d.value, 0) as discount
                FROM products p
                LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                LEFT JOIN discounts d ON p.id = d.product_id AND d.start_date <= CURRENT_DATE AND d.end_date >= CURRENT_DATE
                WHERE p.stock > 0
                AND p.average_rating >= 4.0
                ORDER BY p.average_rating DESC, p.id
                LIMIT $1
            """, limit)
            
            products = [dict(row) for row in rows]
            
        return {
            "success": True,
            "message": "Guest recommendations retrieved successfully",
            "data": products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving guest recommendations: {str(e)}") 

# Admin products endpoint with rating information
@router.get("/admin/all", response_model=List[ProductOut])
async def get_admin_products_route():
    """Get all products with rating information for admin dashboard"""
    try:
        from app.models.review import Review
        from app.database import get_db_connection
        
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Get products with rating information
            rows = await conn.fetch("""
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    p.price,
                    p.stock,
                    p.brand,
                    p.material,
                    p.colors,
                    p.sizes,
                    p.care_instructions,
                    p.features,
                    p.specifications,
                    COALESCE(AVG(r.rating), 0.0) as rating,
                    COALESCE(COUNT(r.id), 0) as total_reviews
                FROM products p
                LEFT JOIN reviews r ON p.id = r.product_id
                GROUP BY p.id, p.name, p.description, p.price, p.stock, p.brand, 
                         p.material, p.colors, p.sizes, p.care_instructions, 
                         p.features, p.specifications
                ORDER BY p.id DESC
            """)
            
            result = []
            for row in rows:
                # Get tags for each product
                tags = await get_product_tags(row['id'])
                
                result.append(ProductOut(
                    id=row['id'],
                    name=row['name'],
                    description=row['description'],
                    price=float(row['price']),
                    stock=row['stock'],
                    brand=row['brand'],
                    material=row['material'],
                    colors=json.loads(row['colors']) if row['colors'] and isinstance(row['colors'], str) else (row['colors'] or []),
                    sizes=json.loads(row['sizes']) if row['sizes'] and isinstance(row['sizes'], str) else (row['sizes'] or []),
                    care_instructions=row['care_instructions'],
                    features=json.loads(row['features']) if row['features'] and isinstance(row['features'], str) else (row['features'] or []),
                    specifications=json.loads(row['specifications']) if row['specifications'] and isinstance(row['specifications'], str) else (row['specifications'] or {}),
                    rating=float(row['rating']) if row['rating'] else 0.0,
                    reviews=row['total_reviews'],
                    images=[],
                    tags=tags
                ))
            
            return result
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving admin products: {str(e)}"
        ) 

@router.get("/{product_id}/recommendations/price-range", response_model=List[ProductCard])
async def get_product_price_range_recommendations(
    product_id: int,
    limit: int = Query(8, ge=1, le=20)
):
    """Get product recommendations within similar price range of the current product."""
    try:
        # Get the current product
        current_product = await get_product_by_id(product_id)
        if not current_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Calculate price range (±25% of current product price)
        price_min = float(current_product.price) * 0.75
        price_max = float(current_product.price) * 1.25
        
        # Get products with similar price range, excluding the current product
        from app.crud.product_crud import get_products_by_price_range
        products = await get_products_by_price_range(price_min, price_max)
        
        # Filter out the current product and limit results
        filtered_products = [p for p in products if p.id != product_id]
        
        # Randomize and limit
        import random
        random.shuffle(filtered_products)
        filtered_products = filtered_products[:limit]
        
        product_cards = []
        for p in filtered_products:
            product_data = await Product.get_product_for_card(p.id)
            if product_data:
                product_card = ProductCard(
                    id=product_data["id"],
                    name=product_data["name"],
                    description=product_data["description"],
                    price=float(product_data["price"]),
                    stock=product_data["stock"],
                    image=product_data["image"],
                    discount=float(product_data["discount"]),
                    rating=float(product_data["rating"]) if product_data["rating"] else None,
                    total_reviews=product_data["total_reviews"],
                    category=product_data.get("category")
                )
                product_cards.append(product_card)
        
        return product_cards
        
    except Exception as e:
        print(f"Error getting price range recommendations: {e}")
        return []

@router.get("/{product_id}/recommendations/category", response_model=List[ProductCard])
async def get_product_category_recommendations(
    product_id: int,
    limit: int = Query(8, ge=1, le=20)
):
    """Get product recommendations from the same category as the current product."""
    try:
        # Get the current product
        current_product = await get_product_by_id(product_id)
        if not current_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Get product tags/categories
        tags = await get_product_tags(product_id)
        if not tags:
            return []
        
        # Get the main category (first tag)
        main_tag = tags[0]
        tag_id = main_tag['id'] if isinstance(main_tag, dict) else main_tag
        
        # Get products by tag, excluding the current product
        products = await get_products_by_tag_id(tag_id)
        filtered_products = [p for p in products if p.id != product_id]
        
        # Randomize and limit
        import random
        random.shuffle(filtered_products)
        filtered_products = filtered_products[:limit]
        
        product_cards = []
        for p in filtered_products:
            product_data = await Product.get_product_for_card(p.id)
            if product_data:
                product_card = ProductCard(
                    id=product_data["id"],
                    name=product_data["name"],
                    description=product_data["description"],
                    price=float(product_data["price"]),
                    stock=product_data["stock"],
                    image=product_data["image"],
                    discount=float(product_data["discount"]),
                    rating=float(product_data["rating"]) if product_data["rating"] else None,
                    total_reviews=product_data["total_reviews"],
                    category=product_data.get("category")
                )
                product_cards.append(product_card)
        
        return product_cards
        
    except Exception as e:
        print(f"Error getting category recommendations: {e}")
        return [] 