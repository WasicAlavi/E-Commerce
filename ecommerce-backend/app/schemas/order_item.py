# app/schemas/order_item.py

from pydantic import BaseModel, Field, validator
from typing import Optional, List

class OrderItemBase(BaseModel):
    quantity: int = Field(..., gt=0, description="Quantity of the product")
    price: float = Field(..., gt=0, description="Price per unit")

    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v

    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than 0')
        return round(v, 2)

class OrderItemCreate(OrderItemBase):
    order_id: int = Field(..., description="ID of the order")
    product_id: int = Field(..., description="ID of the product")

class OrderItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, gt=0, description="Quantity of the product")
    price: Optional[float] = Field(None, gt=0, description="Price per unit")

    @validator('quantity')
    def validate_quantity(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v

    @validator('price')
    def validate_price(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Price must be greater than 0')
        return round(v, 2) if v else v

class OrderItemOut(OrderItemBase):
    id: int = Field(..., description="Order item ID")
    order_id: int = Field(..., description="ID of the order")
    product_id: int = Field(..., description="ID of the product")

    class Config:
        from_attributes = True

class OrderItemWithProduct(OrderItemOut):
    product_name: str = Field(..., description="Product name")
    product_image: Optional[str] = Field(None, description="Product image URL")
    total_price: float = Field(..., description="Total price for this item")

class OrderItemList(BaseModel):
    items: List[OrderItemOut] = Field(..., description="List of order items")
    total: int = Field(..., description="Total number of items")
    total_price: float = Field(..., description="Total price of all items")

class OrderItemResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[OrderItemOut] = Field(None, description="Order item data")
