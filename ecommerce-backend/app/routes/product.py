from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut, ProductCard, ProductCardList
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

router = APIRouter(prefix="/products", tags=["products"])

# Product routes
@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product_route(product: ProductCreate):
    """Create a new product"""
    try:
        db_product = await create_product(product)
        return ProductOut(
            id=db_product.id,
            name=db_product.name,
            description=db_product.description,
            price=float(db_product.price),
            stock=db_product.stock,
            images=[],
            tags=[]
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
    
    return [
        ProductOut(
            id=product.id,
            name=product.name,
            description=product.description,
            price=float(product.price),
            stock=product.stock,
            images=[],
            tags=[]
        ) for product in products
    ]

# New ProductCard endpoints
@router.get("/card", response_model=ProductCardList)
async def get_products_for_card(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Products per page"),
    search: Optional[str] = Query(None, description="Search term")
):
    """Get products formatted for ProductCard components"""
    try:
        offset = (page - 1) * per_page
        
        if search:
            products_data = await Product.search_products_for_card(search, per_page, offset)
        else:
            products_data = await Product.get_products_for_card(per_page, offset)
        
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
            total=len(products),  # In a real app, you'd get total count from database
            page=page,
            per_page=per_page
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {str(e)}")

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

@router.get("/{product_id}", response_model=ProductOut)
async def get_product_route(product_id: int):
    """Get product by ID"""
    product = await get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Get images and tags
    images = await get_product_images(product_id)
    tags = await get_product_tags(product_id)
    
    return ProductOut(
        id=product.id,
        name=product.name,
        description=product.description,
        price=float(product.price),
        stock=product.stock,
        images=[
            ProductImageOut(
                id=img.id,
                image_url=img.image_url,
                is_primary=img.is_primary
            ) for img in images
        ],
        tags=tags
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