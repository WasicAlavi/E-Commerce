from typing import List, Optional, Dict, Any
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.cart import Cart
from app.schemas.order import OrderCreate, OrderUpdate, OrderOut
from app.schemas.order_item import OrderItemCreate

async def create_order(order_data: OrderCreate) -> Dict[str, Any]:
    """Create a new order from cart"""
    try:
        # Create the order
        order = await Order.create(
            customer_id=order_data.customer_id,
            total_price=order_data.total_price,
            address_id=order_data.address_id or 1,  # Default address if not provided
            payment_id=order_data.payment_id
        )
        
        # Add order items
        if order_data.items:
            for item_data in order_data.items:
                await OrderItem.create(
                    order_id=order.id,
                    product_id=item_data.product_id,
                    quantity=item_data.quantity,
                    price=item_data.price
                )
        
        # Clear the customer's cart after successful order
        try:
            cart = await Cart.get_by_customer_id(order_data.customer_id)
            if cart:
                # Mark cart as deleted (soft delete) instead of just clearing items
                await cart.mark_as_deleted()
        except Exception as e:
            print(f"Warning: Could not mark cart as deleted after order: {e}")
        
        # Return order data as dictionary with proper date formatting
        return order.to_dict()
    except Exception as e:
        print(f"Error creating order: {e}")
        raise e

async def get_order_by_id(order_id: int) -> Optional[Dict[str, Any]]:
    """Get order by ID"""
    order = await Order.get_by_id(order_id)
    return order.to_dict() if order else None

async def get_order_by_secure_id(secure_order_id: str) -> Optional[Dict[str, Any]]:
    """Get order by secure order ID"""
    order = await Order.get_by_secure_id(secure_order_id)
    return order.to_dict() if order else None

async def get_orders(skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """Get all orders with pagination"""
    orders = await Order.get_all(skip=skip, limit=limit)
    return [order.to_dict() for order in orders]

async def get_orders_by_customer(customer_id: int, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """Get orders by customer ID, including items for each order"""
    orders = await Order.get_by_customer_id_with_details(customer_id)
    return orders

async def get_orders_by_status(status: str, skip: int = 0, limit: int = 100) -> List[Order]:
    """Get orders by status"""
    # This would need to be implemented in the Order model
    return []

async def update_order(order_id: int, order_data: OrderUpdate) -> Optional[Dict[str, Any]]:
    """Update order"""
    order = await Order.get_by_id(order_id)
    if not order:
        return None
    
    update_data = {}
    if order_data.total_amount is not None:
        update_data['total_amount'] = order_data.total_amount
    if order_data.shipping_address_id is not None:
        update_data['shipping_address_id'] = order_data.shipping_address_id
    if order_data.billing_address_id is not None:
        update_data['billing_address_id'] = order_data.billing_address_id
    if order_data.payment_method_id is not None:
        update_data['payment_method_id'] = order_data.payment_method_id
    if order_data.status is not None:
        update_data['status'] = order_data.status
    if order_data.notes is not None:
        update_data['notes'] = order_data.notes
    
    updated_order = await order.update(**update_data)
    return updated_order.to_dict() if updated_order else None

async def delete_order(order_id: int) -> bool:
    """Delete order"""
    order = await Order.get_by_id(order_id)
    if not order:
        return False
    return await order.delete()

async def get_order_with_items(order_id: int) -> Optional[dict]:
    """Get order with items"""
    return await Order.get_by_id_with_details(order_id)

async def get_order_with_details(order_id: int) -> Optional[dict]:
    """Get order with customer and payment details"""
    return await Order.get_by_id_with_details(order_id)

# Order Item CRUD operations
async def add_order_item(item_data: OrderItemCreate) -> Dict[str, Any]:
    """Add item to order"""
    item = await OrderItem.create(
        order_id=item_data.order_id,
        product_id=item_data.product_id,
        quantity=item_data.quantity,
        price=item_data.price
    )
    return item.to_dict()

async def get_order_items(order_id: int) -> List[Dict[str, Any]]:
    """Get all items for an order"""
    items = await OrderItem.get_by_order_id(order_id)
    return [item.to_dict() for item in items]

async def update_order_item(item_id: int, quantity: int, price: float) -> Optional[Dict[str, Any]]:
    """Update order item"""
    item = await OrderItem.get_by_id(item_id)
    if not item:
        return None
    updated_item = await item.update(quantity=quantity, price=price)
    return updated_item.to_dict() if updated_item else None

async def delete_order_item(item_id: int) -> bool:
    """Delete order item"""
    item = await OrderItem.get_by_id(item_id)
    if not item:
        return False
    return await item.delete()

async def get_order_item_with_product(item_id: int) -> Optional[dict]:
    """Get order item with product details"""
    return await OrderItem.get_with_product(item_id) 