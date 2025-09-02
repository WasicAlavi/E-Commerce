from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.crud import order_crud
from app.schemas.order import (
    OrderCreate, OrderUpdate, OrderOut, OrderWithDetails, 
    OrderList, OrderResponse
)
from app.schemas.order_item import OrderItemCreate, OrderItemOut

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=OrderResponse)
async def create_order(order_data: OrderCreate):
    """Create a new order"""
    try:
        order = await order_crud.create_order(order_data)
        return OrderResponse(
            success=True,
            message="Order created successfully",
            data=order
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int):
    """Get order by ID"""
    order = await order_crud.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return OrderResponse(
        success=True,
        message="Order retrieved successfully",
        data=order
    )

@router.get("/secure/{secure_order_id}", response_model=OrderResponse)
async def get_order_by_secure_id(secure_order_id: str):
    """Get order by secure order ID"""
    order = await order_crud.get_order_by_secure_id(secure_order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return OrderResponse(
        success=True,
        message="Order retrieved successfully",
        data=order
    )

@router.get("/track/{secure_order_id}")
async def track_order(secure_order_id: str):
    """Track order with shipping information"""
    try:
        print(f"Tracking order with ID: {secure_order_id}")
        
        # Get order details
        order = await order_crud.get_order_by_secure_id(secure_order_id)
        if not order:
            print(f"Order not found for ID: {secure_order_id}")
            raise HTTPException(status_code=404, detail="Order not found")
        
        print(f"Order found: {order}")
        
        # Get shipping information if available
        from app.models.shipping import ShippingInfo
        shipping_info = await ShippingInfo.get_by_order_id(order['id'])
        
        # Get delivery assignment information if available
        from app.models.delivery_assignment import DeliveryAssignment
        delivery_assignment = await DeliveryAssignment.get_by_order_id(order['id'])
        
        # Get rider information if delivery assignment exists
        rider_info = None
        if delivery_assignment:
            from app.models.rider import Rider
            from app.models.customer import Customer as RiderCustomer
            from app.models.user import User as RiderUser
            
            rider = await Rider.get_by_id(delivery_assignment.rider_id)
            if rider:
                rider_customer = await RiderCustomer.get_by_id(rider.customer_id)
                rider_user = await RiderUser.get_by_id(rider.user_id) if rider else None
                
                rider_info = {
                    "id": rider.id,
                    "name": f"{rider_customer.first_name} {rider_customer.last_name}".strip() if rider_customer else "Unknown Rider",
                    "phone": rider_customer.phone if rider_customer else None,
                    "email": rider_user.email if rider_user else None,
                    "vehicle_type": rider.vehicle_type,
                    "delivery_zones": rider.delivery_zones,
                    "is_active": rider.is_active
                }
        
        # Get order items
        from app.models.order_item import OrderItem
        items = await OrderItem.get_by_order_id(order['id'])
        
        # Get customer information
        from app.models.customer import Customer
        customer = await Customer.get_by_id(order['customer_id'])
        
        # Get user information for email
        from app.models.user import User
        user = await User.get_by_id(customer.user_id) if customer else None
        
        # Get address information
        from app.models.address import Address
        address = await Address.get_by_id(order['address_id']) if order['address_id'] else None
        
        # Prepare tracking data
        tracking_data = {
            "order": {
                "id": order['id'],
                "secure_order_id": order['secure_order_id'],
                "status": order['status'],
                "order_date": order['order_date'],
                "total_price": order['total_price'],
                "transaction_id": order.get('transaction_id')
            },
            "customer": {
                "first_name": customer.first_name if customer else None,
                "last_name": customer.last_name if customer else None,
                "email": user.email if user else None,
                "phone": customer.phone if customer else None
            },
            "address": address.to_dict() if address else None,
            "items": [item.to_dict() for item in items] if items else [],
            "shipping_info": shipping_info.to_dict() if shipping_info else None,
            "delivery_assignment": delivery_assignment.to_dict() if delivery_assignment else None,
            "rider_info": rider_info
        }
        
        return {
            "success": True,
            "message": "Order tracking information retrieved successfully",
            "data": tracking_data
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Error tracking order: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error tracking order: {str(e)}")

@router.get("/", response_model=OrderList)
async def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all orders with pagination"""
    orders = await order_crud.get_orders(skip=skip, limit=limit)
    total = len(orders)
    
    return OrderList(
        orders=orders,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/customer/{customer_id}", response_model=OrderList)
async def get_orders_by_customer(
    customer_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get orders by customer ID"""
    orders = await order_crud.get_orders_by_customer(customer_id, skip=skip, limit=limit)
    total = len(orders)
    
    return OrderList(
    orders=orders,
    total=total,
    skip=skip,
    limit=limit,
    page=1,         # or your actual page logic
    per_page=limit  # or your actual per_page logic
)

@router.get("/status/{status}", response_model=OrderList)
async def get_orders_by_status(
    status: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get orders by status"""
    orders = await order_crud.get_orders_by_status(status, skip=skip, limit=limit)
    total = len(orders)
    
    return OrderList(
        orders=orders,
        total=total,
        skip=skip,
        limit=limit
    )

@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(order_id: int, order_data: OrderUpdate):
    """Update order"""
    order = await order_crud.update_order(order_id, order_data)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return OrderResponse(
        success=True,
        message="Order updated successfully",
        data=order
    )

@router.delete("/{order_id}")
async def delete_order(order_id: int):
    """Delete order"""
    success = await order_crud.delete_order(order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"success": True, "message": "Order deleted successfully"}

@router.get("/{order_id}/with-items", response_model=dict)
async def get_order_with_items(order_id: int):
    """Get order with items"""
    print(f"DEBUG: /orders/{order_id}/with-items called")
    try:
        print(f"DEBUG: Fetching order with items for order_id={order_id}")
        order_data = await order_crud.get_order_with_items(order_id)
        if not order_data:
            print(f"DEBUG: No order found for order_id={order_id}")
            raise HTTPException(status_code=404, detail="Order not found")
        print(f"DEBUG: Order data fetched for order_id={order_id}: {order_data}")
        return {
            "success": True,
            "message": "Order with items retrieved successfully",
            "data": order_data
        }
    except Exception as e:
        print(f"DEBUG: Exception in /orders/{order_id}/with-items: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{order_id}/with-details", response_model=dict)
async def get_order_with_details(order_id: int):
    """Get order with customer and payment details"""
    order_data = await order_crud.get_order_with_details(order_id)
    if not order_data:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "success": True,
        "message": "Order with details retrieved successfully",
        "data": order_data
    }

# Order Item Routes
@router.post("/{order_id}/items", response_model=dict)
async def add_order_item(order_id: int, item_data: OrderItemCreate):
    """Add item to order"""
    try:
        item = await order_crud.add_order_item(item_data)
        return {
            "success": True,
            "message": "Item added to order successfully",
            "data": item
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{order_id}/items", response_model=List[OrderItemOut])
async def get_order_items(order_id: int):
    """Get all items for an order"""
    items = await order_crud.get_order_items(order_id)
    return items

@router.put("/items/{item_id}", response_model=dict)
async def update_order_item(item_id: int, quantity: int, price: float):
    """Update order item"""
    item = await order_crud.update_order_item(item_id, quantity, price)
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")
    
    return {
        "success": True,
        "message": "Order item updated successfully",
        "data": item
    }

@router.delete("/items/{item_id}")
async def delete_order_item(item_id: int):
    """Delete order item"""
    success = await order_crud.delete_order_item(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order item not found")
    
    return {"success": True, "message": "Order item deleted successfully"}

@router.get("/items/{item_id}/with-product", response_model=dict)
async def get_order_item_with_product(item_id: int):
    """Get order item with product details"""
    item_data = await order_crud.get_order_item_with_product(item_id)
    if not item_data:
        raise HTTPException(status_code=404, detail="Order item not found")
    
    return {
        "success": True,
        "message": "Order item with product details retrieved successfully",
        "data": item_data
    } 