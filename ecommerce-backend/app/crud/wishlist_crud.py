from typing import List, Optional
from app.models.wishlist import Wishlist
from app.models.wishlist_item import WishlistItem
from app.schemas.wishlist import WishlistCreate, WishlistOut
from app.schemas.wishlist_item import WishlistItemCreate

async def create_wishlist(wishlist_data: WishlistCreate) -> Wishlist:
    """Create a new wishlist"""
    return await Wishlist.create(customer_id=wishlist_data.customer_id)

async def get_wishlist_by_id(wishlist_id: int) -> Optional[Wishlist]:
    """Get wishlist by ID"""
    return await Wishlist.get_by_id(wishlist_id)

async def get_wishlist_by_customer(customer_id: int) -> Optional[Wishlist]:
    """Get wishlist by customer ID"""
    return await Wishlist.get_by_customer_id(customer_id)

async def get_wishlists(skip: int = 0, limit: int = 100) -> List[Wishlist]:
    """Get all wishlists with pagination"""
    return await Wishlist.get_all(skip=skip, limit=limit)

async def delete_wishlist(wishlist_id: int) -> bool:
    """Delete wishlist"""
    wishlist = await Wishlist.get_by_id(wishlist_id)
    if not wishlist:
        return False
    return await wishlist.delete()

async def get_wishlist_with_items(wishlist_id: int) -> Optional[dict]:
    """Get wishlist with items"""
    return await Wishlist.get_with_items(wishlist_id)

async def get_wishlist_with_details(wishlist_id: int) -> Optional[dict]:
    """Get wishlist with customer and item details"""
    return await Wishlist.get_with_details(wishlist_id)

async def clear_wishlist(wishlist_id: int) -> bool:
    """Clear all items from wishlist"""
    wishlist = await Wishlist.get_by_id(wishlist_id)
    if not wishlist:
        return False
    return await wishlist.clear_items()

# Wishlist Item CRUD operations
async def add_wishlist_item(item_data: WishlistItemCreate) -> WishlistItem:
    """Add item to wishlist"""
    return await WishlistItem.create(
        wishlist_id=item_data.wishlist_id,
        product_id=item_data.product_id
    )

async def get_wishlist_item_by_id(item_id: int) -> Optional[WishlistItem]:
    """Get wishlist item by ID"""
    return await WishlistItem.get_by_id(item_id)

async def get_wishlist_items(wishlist_id: int) -> List[WishlistItem]:
    """Get all items in a wishlist"""
    return await WishlistItem.get_by_wishlist_id(wishlist_id)

async def remove_wishlist_item(item_id: int) -> bool:
    """Remove item from wishlist"""
    item = await WishlistItem.get_by_id(item_id)
    if not item:
        return False
    return await item.delete()

async def get_wishlist_item_with_product(item_id: int) -> Optional[dict]:
    """Get wishlist item with product details"""
    return await WishlistItem.get_with_product(item_id)

async def check_wishlist_item_exists(wishlist_id: int, product_id: int) -> Optional[WishlistItem]:
    """Check if item exists in wishlist"""
    return await WishlistItem.get_by_wishlist_and_product(wishlist_id, product_id)

async def get_wishlist_item_count(wishlist_id: int) -> int:
    """Get number of items in wishlist"""
    return await Wishlist.get_item_count(wishlist_id)

async def move_to_cart(wishlist_id: int, product_id: int, cart_id: int) -> bool:
    """Move item from wishlist to cart"""
    wishlist_item = await WishlistItem.get_by_wishlist_and_product(wishlist_id, product_id)
    if not wishlist_item:
        return False
    
    # Add to cart (you'll need to implement cart item creation)
    # Remove from wishlist
    return await wishlist_item.delete() 