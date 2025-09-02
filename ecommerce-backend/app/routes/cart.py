from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.crud import cart_crud
from app.schemas.cart import (
    CartCreate, CartOut, CartWithDetails, CartList, CartResponse
)
from app.schemas.cart_item import CartItemCreate, CartItemUpdate, CartItemOut
from app.utils.jwt_utils import get_current_user, get_current_admin
from app.database import get_db_connection

router = APIRouter(prefix="/carts", tags=["carts"])

@router.post("/", response_model=CartResponse)
async def create_cart(cart_data: CartCreate, current_user: dict = Depends(get_current_user)):
    """Create a new cart"""
    try:
        # Ensure the cart belongs to the authenticated user's customer
        from app.models.customer import Customer
        customer = await Customer.get_by_user_id(current_user["user_id"])
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Update cart_data with customer_id
        cart_data.customer_id = customer.id
        
        cart = await cart_crud.create_cart(cart_data)
        return CartResponse(
            success=True,
            message="Cart created successfully",
            data=cart
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{cart_id}", response_model=CartResponse)
async def get_cart(cart_id: int):
    """Get cart by ID"""
    cart = await cart_crud.get_cart_by_id(cart_id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart_dict = cart.to_dict()
    if 'items' in cart_dict and isinstance(cart_dict['items'], list):
        cart_dict['items'] = [item.to_dict() if hasattr(item, 'to_dict') else item for item in cart_dict['items']]
    return CartResponse(
        success=True,
        message="Cart retrieved successfully",
        data=cart_dict
    )

@router.get("/customer/{customer_id}", response_model=CartResponse)
async def get_cart_by_customer(customer_id: int, current_user: dict = Depends(get_current_user)):
    """Get cart by customer ID"""
    # Verify the customer belongs to the authenticated user
    from app.models.customer import Customer
    customer = await Customer.get_by_user_id(current_user["user_id"])
    if not customer or customer.id != customer_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    cart = await cart_crud.get_cart_by_customer(customer_id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Get cart with items
    cart_dict = await cart.get_with_items()
    return CartResponse(
        success=True,
        message="Cart retrieved successfully",
        data=cart_dict
    )

@router.get("/", response_model=CartList)
async def get_carts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all carts with pagination"""
    carts = await cart_crud.get_carts(skip=skip, limit=limit)
    total = len(carts)
    
    return CartList(
        carts=carts,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/admin/all", dependencies=[Depends(get_current_admin)])
async def get_all_carts_for_admin():
    """Get all carts with totals and item counts for admin"""
    from app.models.cart import Cart
    from app.models.cart_item import CartItem
    
    pool = await get_db_connection()
    async with pool.acquire() as conn:
        # Get only carts that have items (non-empty carts)
        rows = await conn.fetch("""
            SELECT DISTINCT
                c.id, c.customer_id, c.creation_date, c.is_active, c.is_deleted,
                CONCAT(cust.first_name, ' ', cust.last_name) as customer_name
            FROM carts c
            LEFT JOIN customers cust ON c.customer_id = cust.id
            INNER JOIN cart_items ci ON c.id = ci.cart_id
            WHERE ci.is_deleted = FALSE  -- Only include carts with non-deleted items
            ORDER BY c.creation_date DESC
        """)
        
        carts_with_details = []
        for row in rows:
            cart_data = dict(row)
            
            # Get total items and price for this cart
            total_items = await CartItem.get_cart_total_items(cart_data['id'])
            total_price = await CartItem.get_cart_total_price(cart_data['id'])
            
            # Only include carts that actually have items
            if total_items > 0:
                cart_data['total_items'] = total_items
                cart_data['total_price'] = total_price
                carts_with_details.append(cart_data)
        
        return {
            "success": True,
            "message": "Carts retrieved successfully",
            "data": {
                "carts": carts_with_details,
                "total": len(carts_with_details)
            }
        }

@router.delete("/{cart_id}")
async def delete_cart(cart_id: int):
    """Delete cart"""
    success = await cart_crud.delete_cart(cart_id)
    if not success:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    return {"success": True, "message": "Cart deleted successfully"}

@router.get("/{cart_id}/with-items", response_model=dict)
async def get_cart_with_items(cart_id: int):
    """Get cart with items"""
    cart_data = await cart_crud.get_cart_with_items(cart_id)
    if not cart_data:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    return {
        "success": True,
        "message": "Cart with items retrieved successfully",
        "data": cart_data
    }

@router.get("/{cart_id}/with-details", response_model=dict)
async def get_cart_with_details(cart_id: int):
    """Get cart with customer and item details"""
    cart_data = await cart_crud.get_cart_with_details(cart_id)
    if not cart_data:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    return {
        "success": True,
        "message": "Cart with details retrieved successfully",
        "data": cart_data
    }

@router.post("/{cart_id}/clear")
async def clear_cart(cart_id: int):
    """Clear all items from cart"""
    success = await cart_crud.clear_cart(cart_id)
    if not success:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    return {"success": True, "message": "Cart cleared successfully"}

@router.get("/{cart_id}/total")
async def get_cart_total(cart_id: int):
    """Get cart total amount"""
    total = await cart_crud.get_cart_total(cart_id)
    return {
        "success": True,
        "message": "Cart total retrieved successfully",
        "data": {"total": total}
    }

# Cart Item Routes
@router.post("/{cart_id}/items", response_model=CartItemOut)
async def add_cart_item(cart_id: int, item_data: CartItemCreate):
    """Add item to cart"""
    try:
        item = await cart_crud.add_cart_item(item_data)
        return CartItemOut.model_validate(item)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/items/{item_id}", response_model=CartItemOut)
async def get_cart_item(item_id: int):
    """Get cart item by ID"""
    item = await cart_crud.get_cart_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return item

@router.get("/{cart_id}/items", response_model=List[CartItemOut])
async def get_cart_items(cart_id: int):
    """Get all items in a cart"""
    items = await cart_crud.get_cart_items(cart_id)
    return [CartItemOut.model_validate(item) for item in items]

@router.get("/{cart_id}/items-with-products", dependencies=[Depends(get_current_admin)])
async def get_cart_items_with_products(cart_id: int):
    """Get all items in a cart with product details"""
    from app.models.cart_item import CartItem
    items = await CartItem.get_by_cart_id_with_products(cart_id)
    return {
        "success": True,
        "message": "Cart items with products retrieved successfully",
        "data": items
    }

@router.put("/items/{item_id}/quantity")
async def update_cart_item_quantity(item_id: int, quantity: int):
    """Update cart item quantity"""
    item = await cart_crud.update_cart_item_quantity(item_id, quantity)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    return {
        "success": True,
        "message": "Cart item quantity updated successfully",
        "data": item
    }

@router.delete("/items/{item_id}")
async def remove_cart_item(item_id: int):
    """Remove item from cart"""
    success = await cart_crud.remove_cart_item(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    return {"success": True, "message": "Cart item removed successfully"}

@router.get("/items/{item_id}/with-product", response_model=dict)
async def get_cart_item_with_product(item_id: int):
    """Get cart item with product details"""
    item_data = await cart_crud.get_cart_item_with_product(item_id)
    if not item_data:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    return {
        "success": True,
        "message": "Cart item with product details retrieved successfully",
        "data": item_data
    }

@router.get("/{cart_id}/items/check/{product_id}")
async def check_cart_item_exists(cart_id: int, product_id: int):
    """Check if item exists in cart"""
    item = await cart_crud.check_cart_item_exists(cart_id, product_id)
    return {
        "success": True,
        "message": "Cart item check completed",
        "data": {"exists": item is not None, "item": item}
    } 