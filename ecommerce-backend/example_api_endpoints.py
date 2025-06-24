#!/usr/bin/env python3
"""
Example API endpoints for ProductCard functionality
"""

from fastapi import FastAPI, HTTPException, Query
from typing import List, Optional
from app.schemas.product import ProductCard, ProductCardList
from app.models.product import Product

app = FastAPI()

@app.get("/api/products/card", response_model=ProductCardList)
async def get_products_for_card(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Products per page"),
    search: Optional[str] = Query(None, description="Search term")
):
    """
    Get products formatted for ProductCard components
    """
    try:
        offset = (page - 1) * per_page
        
        if search:
            products_data = await Product.search_products_for_card(search, per_page, offset)
        else:
            products_data = await Product.get_products_for_card(per_page, offset)
        
        # Convert to ProductCard objects
        products = []
        for product_data in products_data:
            # Ensure all required fields are present
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

@app.get("/api/products/{product_id}/card", response_model=ProductCard)
async def get_product_for_card(product_id: int):
    """
    Get a single product formatted for ProductCard component
    """
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
            total_reviews=product_data["total_reviews"]
        )
        
        return product_card
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch product: {str(e)}")

@app.get("/api/products/card/featured", response_model=List[ProductCard])
async def get_featured_products(limit: int = Query(8, ge=1, le=20)):
    """
    Get featured products for ProductCard components
    """
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

# Example of how the frontend would use this data
def example_frontend_usage():
    """
    Example of how the frontend would consume the API data
    """
    # This is just for demonstration - not actual code
    example_response = {
        "products": [
            {
                "id": 1,
                "name": "Sample Product",
                "description": "Product description",
                "price": 100.00,
                "stock": 10,
                "image": "https://via.placeholder.com/300x300?text=Sample+Product",
                "discount": 0.2,
                "rating": 4.5,
                "total_reviews": 25
            }
        ],
        "total": 1,
        "page": 1,
        "per_page": 20
    }
    
    print("Example API response:")
    print(json.dumps(example_response, indent=2))
    
    print("\nFrontend usage:")
    print("1. Fetch products: GET /api/products/card?page=1&per_page=20")
    print("2. Search products: GET /api/products/card?search=keyword")
    print("3. Get single product: GET /api/products/1/card")
    print("4. Get featured products: GET /api/products/card/featured?limit=8")

if __name__ == "__main__":
    import json
    example_frontend_usage() 