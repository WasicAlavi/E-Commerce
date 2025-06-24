from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.crud import wishlist_crud
from app.schemas.wishlist import (
    WishlistCreate, WishlistOut, WishlistWithItems, WishlistList, WishlistResponse
)
from app.schemas.wishlist_item import WishlistItemCreate, WishlistItemOut

router = APIRouter(prefix="/wishlists", tags=["wishlists"])

@router.post("/", response_model=WishlistResponse)
async def create_wishlist(wishlist_data: WishlistCreate):
    """Create a new wishlist"""
    try:
        wishlist = await wishlist_crud.create_wishlist(wishlist_data)
        return WishlistResponse(
            success=True,
            message="Wishlist created successfully",
            data=wishlist
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{wishlist_id}", response_model=WishlistResponse)
async def get_wishlist(wishlist_id: int):
    """Get wishlist by ID"""
    wishlist = await wishlist_crud.get_wishlist_by_id(wishlist_id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    
    return WishlistResponse(
        success=True,
        message="Wishlist retrieved successfully",
        data=wishlist
    )

@router.get("/customer/{customer_id}", response_model=WishlistResponse)
async def get_wishlist_by_customer(customer_id: int):
    """Get wishlist by customer ID"""
    wishlist = await wishlist_crud.get_wishlist_by_customer(customer_id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    
    return WishlistResponse(
        success=True,
        message="Wishlist retrieved successfully",
        data=wishlist
    )

@router.get("/", response_model=WishlistList)
async def get_wishlists(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all wishlists with pagination"""
    wishlists = await wishlist_crud.get_wishlists(skip=skip, limit=limit)
    total = len(wishlists)
    
    return WishlistList(
        wishlists=wishlists,
        total=total,
        skip=skip,
        limit=limit
    )

@router.delete("/{wishlist_id}")
async def delete_wishlist(wishlist_id: int):
    """Delete wishlist"""
    success = await wishlist_crud.delete_wishlist(wishlist_id)
    if not success:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    
    return {"success": True, "message": "Wishlist deleted successfully"}

@router.get("/{wishlist_id}/with-items", response_model=dict)
async def get_wishlist_with_items(wishlist_id: int):
    """Get wishlist with items"""
    wishlist_data = await wishlist_crud.get_wishlist_with_items(wishlist_id)
    if not wishlist_data:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    
    return {
        "success": True,
        "message": "Wishlist with items retrieved successfully",
        "data": wishlist_data
    }

@router.get("/{wishlist_id}/with-details", response_model=dict)
async def get_wishlist_with_details(wishlist_id: int):
    """Get wishlist with customer and item details"""
    wishlist_data = await wishlist_crud.get_wishlist_with_details(wishlist_id)
    if not wishlist_data:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    
    return {
        "success": True,
        "message": "Wishlist with details retrieved successfully",
        "data": wishlist_data
    }

@router.post("/{wishlist_id}/clear")
async def clear_wishlist(wishlist_id: int):
    """Clear all items from wishlist"""
    success = await wishlist_crud.clear_wishlist(wishlist_id)
    if not success:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    
    return {"success": True, "message": "Wishlist cleared successfully"}

@router.get("/{wishlist_id}/item-count")
async def get_wishlist_item_count(wishlist_id: int):
    """Get number of items in wishlist"""
    count = await wishlist_crud.get_wishlist_item_count(wishlist_id)
    return {
        "success": True,
        "message": "Wishlist item count retrieved successfully",
        "data": {"item_count": count}
    }

@router.post("/{wishlist_id}/move-to-cart/{product_id}")
async def move_to_cart(wishlist_id: int, product_id: int, cart_id: int):
    """Move item from wishlist to cart"""
    success = await wishlist_crud.move_to_cart(wishlist_id, product_id, cart_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")
    
    return {"success": True, "message": "Item moved to cart successfully"}

# Wishlist Item Routes
@router.post("/{wishlist_id}/items", response_model=dict)
async def add_wishlist_item(wishlist_id: int, item_data: WishlistItemCreate):
    """Add item to wishlist"""
    try:
        item = await wishlist_crud.add_wishlist_item(item_data)
        return {
            "success": True,
            "message": "Item added to wishlist successfully",
            "data": item
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/items/{item_id}", response_model=WishlistItemOut)
async def get_wishlist_item(item_id: int):
    """Get wishlist item by ID"""
    item = await wishlist_crud.get_wishlist_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    return item

@router.get("/{wishlist_id}/items", response_model=List[WishlistItemOut])
async def get_wishlist_items(wishlist_id: int):
    """Get all items in a wishlist"""
    items = await wishlist_crud.get_wishlist_items(wishlist_id)
    return items

@router.delete("/items/{item_id}")
async def remove_wishlist_item(item_id: int):
    """Remove item from wishlist"""
    success = await wishlist_crud.remove_wishlist_item(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    
    return {"success": True, "message": "Wishlist item removed successfully"}

@router.get("/items/{item_id}/with-product", response_model=dict)
async def get_wishlist_item_with_product(item_id: int):
    """Get wishlist item with product details"""
    item_data = await wishlist_crud.get_wishlist_item_with_product(item_id)
    if not item_data:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    
    return {
        "success": True,
        "message": "Wishlist item with product details retrieved successfully",
        "data": item_data
    }

@router.get("/{wishlist_id}/items/check/{product_id}")
async def check_wishlist_item_exists(wishlist_id: int, product_id: int):
    """Check if item exists in wishlist"""
    item = await wishlist_crud.check_wishlist_item_exists(wishlist_id, product_id)
    return {
        "success": True,
        "message": "Wishlist item check completed",
        "data": {"exists": item is not None, "item": item}
    } 