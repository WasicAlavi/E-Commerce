from typing import List, Optional
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.schemas.cart import CartCreate, CartOut
from app.schemas.cart_item import CartItemCreate, CartItemUpdate

async def create_cart(cart_data: CartCreate) -> Cart:
    """Create a new cart"""
    return await Cart.create(customer_id=cart_data.customer_id)

async def get_cart_by_id(cart_id: int) -> Optional[Cart]:
    """Get cart by ID"""
    return await Cart.get_by_id(cart_id)

async def get_cart_by_customer(customer_id: int) -> Optional[Cart]:
    """Get cart by customer ID"""
    return await Cart.get_by_customer_id(customer_id)

async def get_carts(skip: int = 0, limit: int = 100) -> List[Cart]:
    """Get all carts with pagination"""
    return await Cart.get_all(skip=skip, limit=limit)

async def delete_cart(cart_id: int) -> bool:
    """Delete cart"""
    cart = await Cart.get_by_id(cart_id)
    if not cart:
        return False
    return await cart.delete()

async def get_cart_with_items(cart_id: int) -> Optional[dict]:
    """Get cart with items"""
    return await Cart.get_with_items(cart_id)

async def get_cart_with_details(cart_id: int) -> Optional[dict]:
    """Get cart with customer and item details"""
    return await Cart.get_with_details(cart_id)

async def clear_cart(cart_id: int) -> bool:
    """Clear all items from cart"""
    cart = await Cart.get_by_id(cart_id)
    if not cart:
        return False
    return await cart.clear_items()

# Cart Item CRUD operations
async def add_cart_item(item_data: CartItemCreate) -> CartItem:
    """Add item to cart"""
    return await CartItem.create(
        cart_id=item_data.cart_id,
        product_id=item_data.product_id,
        quantity=item_data.quantity
    )

async def get_cart_item_by_id(item_id: int) -> Optional[CartItem]:
    """Get cart item by ID"""
    return await CartItem.get_by_id(item_id)

async def get_cart_items(cart_id: int) -> List[CartItem]:
    """Get all items in a cart"""
    return await CartItem.get_by_cart_id(cart_id)

async def update_cart_item_quantity(item_id: int, quantity: int) -> Optional[CartItem]:
    """Update cart item quantity"""
    item = await CartItem.get_by_id(item_id)
    if not item:
        return None
    return await item.update_quantity(quantity)

async def remove_cart_item(item_id: int) -> bool:
    """Remove item from cart"""
    item = await CartItem.get_by_id(item_id)
    if not item:
        return False
    return await item.delete()

async def get_cart_item_with_product(item_id: int) -> Optional[dict]:
    """Get cart item with product details"""
    return await CartItem.get_with_product(item_id)

async def get_cart_total(cart_id: int) -> float:
    """Get cart total amount"""
    return await Cart.get_total(cart_id)

async def check_cart_item_exists(cart_id: int, product_id: int) -> Optional[CartItem]:
    """Check if item exists in cart"""
    return await CartItem.get_by_cart_and_product(cart_id, product_id) 