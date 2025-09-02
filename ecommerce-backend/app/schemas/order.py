# app/schemas/order.py

from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
from app.schemas.order_item import OrderItemOut 

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemOut(OrderItemBase):
    id: int
    order_id: int
    product_name: Optional[str] = None
    product_image: Optional[str] = None

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    customer_id: int
    total_price: float
    address_id: int
    payment_id: Optional[int] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    total_price: Optional[float] = None
    address_id: Optional[int] = None
    payment_id: Optional[int] = None

class OrderOut(BaseModel):
    id: int
    customer_id: int
    order_date: str
    total_price: float
    address_id: int
    payment_id: Optional[int] = None
    status: Optional[str] = "Pending"
    items: List[OrderItemOut] = []
    secure_order_id: str

    class Config:
        from_attributes = True

class OrderWithDetails(BaseModel):
    id: int
    customer_id: int
    order_date: str
    total_price: float
    address_id: int
    payment_id: Optional[int] = None
    status: Optional[str] = "Pending"
    items: List[OrderItemOut] = []
    secure_order_id: str
    address: Optional[dict] = None
    payment_method: Optional[str] = None

    class Config:
        from_attributes = True

class OrderList(BaseModel):
    orders: List[OrderOut] = Field(..., description="List of orders")
    total: int = Field(..., description="Total number of orders")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Orders per page")

class OrderResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[OrderOut] = Field(None, description="Order data")
