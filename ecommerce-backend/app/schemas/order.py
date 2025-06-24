# app/schemas/order.py

from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
from app.schemas.order_item import OrderItemOut 

class OrderBase(BaseModel):
    total_price: float = Field(..., gt=0, description="Total order price")
    address_id: int = Field(..., description="Shipping address ID")
    payment_method_id: Optional[int] = Field(None, description="Payment method ID")
    coupon_code: Optional[str] = Field(None, description="Applied coupon code")

    @validator('total_price')
    def validate_total_price(cls, v):
        if v <= 0:
            raise ValueError('Total price must be greater than 0')
        return round(v, 2)

class OrderCreate(OrderBase):
    customer_id: int = Field(..., description="Customer ID")
    items: List[dict] = Field(..., description="List of order items")

class OrderUpdate(BaseModel):
    total_price: Optional[float] = Field(None, gt=0, description="Total order price")
    address_id: Optional[int] = Field(None, description="Shipping address ID")
    payment_method_id: Optional[int] = Field(None, description="Payment method ID")
    coupon_code: Optional[str] = Field(None, description="Applied coupon code")

    @validator('total_price')
    def validate_total_price(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Total price must be greater than 0')
        return round(v, 2) if v else v

class OrderOut(OrderBase):
    id: int = Field(..., description="Order ID")
    customer_id: int = Field(..., description="Customer ID")
    order_date: datetime = Field(..., description="Order creation date")
    status: str = Field(..., description="Order status")
    items: Optional[List[OrderItemOut]] = Field(default=[], description="List of order items")

    class Config:
        from_attributes = True

class OrderWithDetails(OrderOut):
    customer_name: str = Field(..., description="Customer name")
    customer_email: str = Field(..., description="Customer email")
    shipping_address: dict = Field(..., description="Shipping address details")
    payment_method: Optional[dict] = Field(None, description="Payment method details")

class OrderList(BaseModel):
    orders: List[OrderOut] = Field(..., description="List of orders")
    total: int = Field(..., description="Total number of orders")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Orders per page")

class OrderResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[OrderOut] = Field(None, description="Order data")
