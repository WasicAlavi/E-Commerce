from typing import List, Optional
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.order import OrderCreate, OrderUpdate, OrderOut
from app.schemas.order_item import OrderItemCreate

async def create_order(order_data: OrderCreate) -> Order:
    """Create a new order"""
    return await Order.create(
        customer_id=order_data.customer_id,
        total_amount=order_data.total_amount,
        shipping_address_id=order_data.shipping_address_id,
        billing_address_id=order_data.billing_address_id,
        payment_method_id=order_data.payment_method_id,
        status=order_data.status,
        notes=order_data.notes
    )

async def get_order_by_id(order_id: int) -> Optional[Order]:
    """Get order by ID"""
    return await Order.get_by_id(order_id)

async def get_orders(skip: int = 0, limit: int = 100) -> List[Order]:
    """Get all orders with pagination"""
    return await Order.get_all(skip=skip, limit=limit)

async def get_orders_by_customer(customer_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
    """Get orders by customer ID"""
    return await Order.get_by_customer_id(customer_id, skip=skip, limit=limit)

async def get_orders_by_status(status: str, skip: int = 0, limit: int = 100) -> List[Order]:
    """Get orders by status"""
    return await Order.get_by_status(status, skip=skip, limit=limit)

async def update_order(order_id: int, order_data: OrderUpdate) -> Optional[Order]:
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
    
    return await order.update(**update_data)

async def delete_order(order_id: int) -> bool:
    """Delete order"""
    order = await Order.get_by_id(order_id)
    if not order:
        return False
    return await order.delete()

async def get_order_with_items(order_id: int) -> Optional[dict]:
    """Get order with items"""
    return await Order.get_with_items(order_id)

async def get_order_with_details(order_id: int) -> Optional[dict]:
    """Get order with customer and payment details"""
    return await Order.get_with_details(order_id)

# Order Item CRUD operations
async def add_order_item(item_data: OrderItemCreate) -> OrderItem:
    """Add item to order"""
    return await OrderItem.create(
        order_id=item_data.order_id,
        product_id=item_data.product_id,
        quantity=item_data.quantity,
        price=item_data.price
    )

async def get_order_items(order_id: int) -> List[OrderItem]:
    """Get all items for an order"""
    return await OrderItem.get_by_order_id(order_id)

async def update_order_item(item_id: int, quantity: int, price: float) -> Optional[OrderItem]:
    """Update order item"""
    item = await OrderItem.get_by_id(item_id)
    if not item:
        return None
    return await item.update(quantity=quantity, price=price)

async def delete_order_item(item_id: int) -> bool:
    """Delete order item"""
    item = await OrderItem.get_by_id(item_id)
    if not item:
        return False
    return await item.delete()

async def get_order_item_with_product(item_id: int) -> Optional[dict]:
    """Get order item with product details"""
    return await OrderItem.get_with_product(item_id) 