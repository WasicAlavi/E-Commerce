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
        limit=limit
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
    order_data = await order_crud.get_order_with_items(order_id)
    if not order_data:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "success": True,
        "message": "Order with items retrieved successfully",
        "data": order_data
    }

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