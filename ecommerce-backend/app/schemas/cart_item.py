from pydantic import BaseModel, Field, validator
from typing import Optional, List

class CartItemBase(BaseModel):
    product_id: int = Field(..., description="ID of the product")
    quantity: int = Field(..., gt=0, description="Quantity of the product")

    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v

class CartItemCreate(CartItemBase):
    cart_id: int = Field(..., description="ID of the cart")

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0, description="New quantity of the product")

    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v

class CartItemOut(CartItemBase):
    id: int = Field(..., description="Cart item ID")
    cart_id: int = Field(..., description="ID of the cart")

    class Config:
        from_attributes = True

class CartItemWithProduct(CartItemOut):
    product_name: str = Field(..., description="Product name")
    product_price: float = Field(..., description="Product price")
    product_image: Optional[str] = Field(None, description="Product image URL")
    total_price: float = Field(..., description="Total price for this item")

class CartItemList(BaseModel):
    items: List[CartItemWithProduct] = Field(..., description="List of cart items")
    total: int = Field(..., description="Total number of items")
    total_price: float = Field(..., description="Total price of all items")

class CartItemResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[CartItemOut] = Field(None, description="Cart item data")
