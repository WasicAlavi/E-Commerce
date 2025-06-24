from pydantic import BaseModel, Field
from typing import List, Optional
from app.schemas.wishlist_item import WishlistItemOut

class WishlistBase(BaseModel):
    pass 

class WishlistCreate(BaseModel):
    customer_id: int = Field(..., description="ID of the customer")

class WishlistOut(WishlistBase):
    id: int = Field(..., description="Wishlist ID")
    customer_id: int = Field(..., description="ID of the customer")
    items: Optional[List[WishlistItemOut]] = Field(default=[], description="List of wishlist items")

    class Config:
        from_attributes = True

class WishlistWithItems(WishlistOut):
    total_items: int = Field(..., description="Total number of items in wishlist")
    total_value: float = Field(..., description="Total value of all items in wishlist")

class WishlistList(BaseModel):
    wishlists: List[WishlistOut] = Field(..., description="List of wishlists")
    total: int = Field(..., description="Total number of wishlists")

class WishlistResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[WishlistOut] = Field(None, description="Wishlist data")
