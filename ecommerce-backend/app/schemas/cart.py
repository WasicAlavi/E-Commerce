from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.schemas.cart_item import CartItemOut

class CartBase(BaseModel):
    is_active: bool = Field(default=True, description="Whether cart is active")
    is_deleted: bool = Field(default=False, description="Whether cart is deleted")

class CartCreate(BaseModel):
    customer_id: int = Field(..., description="Customer ID")

class CartOut(CartBase):
    id: int = Field(..., description="Cart ID")
    customer_id: int = Field(..., description="Customer ID")
    creation_date: datetime = Field(..., description="Cart creation date")
    items: Optional[List[CartItemOut]] = Field(default=[], description="List of cart items")

    class Config:
        from_attributes = True

class CartWithDetails(CartOut):
    total_items: int = Field(..., description="Total number of items in cart")
    total_price: float = Field(..., description="Total price of all items")
    item_count: int = Field(..., description="Number of unique items")

class CartList(BaseModel):
    carts: List[CartOut] = Field(..., description="List of carts")
    total: int = Field(..., description="Total number of carts")

class CartResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[CartOut] = Field(None, description="Cart data")
