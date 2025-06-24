from pydantic import BaseModel, Field
from typing import Optional, List

class WishlistItemBase(BaseModel):
    product_id: int = Field(..., description="ID of the product")

class WishlistItemCreate(WishlistItemBase):
    wishlist_id: int = Field(..., description="ID of the wishlist")

class WishlistItemOut(WishlistItemBase):
    id: int = Field(..., description="Wishlist item ID")
    wishlist_id: int = Field(..., description="ID of the wishlist")

    class Config:
        from_attributes = True

class WishlistItemWithProduct(WishlistItemOut):
    product_name: str = Field(..., description="Product name")
    product_description: Optional[str] = Field(None, description="Product description")
    product_price: float = Field(..., description="Product price")
    product_stock: int = Field(..., description="Product stock")
    product_image: Optional[str] = Field(None, description="Product image URL")

class WishlistItemList(BaseModel):
    items: List[WishlistItemWithProduct] = Field(..., description="List of wishlist items")
    total: int = Field(..., description="Total number of items")

class WishlistItemResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[WishlistItemOut] = Field(None, description="Wishlist item data")
