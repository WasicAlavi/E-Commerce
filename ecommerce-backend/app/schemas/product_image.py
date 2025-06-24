# app/schemas/product_image.py

from typing import Optional, List
from pydantic import BaseModel, Field, validator

class ProductImageBase(BaseModel):
    image_url: str = Field(..., description="URL of the product image")
    is_primary: bool = Field(default=False, description="Whether this is the primary image")

    @validator('image_url')
    def validate_image_url(cls, v):
        if not v.strip():
            raise ValueError('Image URL cannot be empty')
        return v.strip()

class ProductImageCreate(ProductImageBase):
    product_id: int = Field(..., description="ID of the product")

class ProductImageUpdate(BaseModel):
    image_url: Optional[str] = Field(None, description="URL of the product image")
    is_primary: Optional[bool] = Field(None, description="Whether this is the primary image")

    @validator('image_url')
    def validate_image_url(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Image URL cannot be empty')
        return v.strip() if v else v

class ProductImageOut(ProductImageBase):
    id: int = Field(..., description="Product image ID")
    product_id: int = Field(..., description="ID of the product")

    class Config:
        from_attributes = True

class ProductImageList(BaseModel):
    images: List[ProductImageOut] = Field(..., description="List of product images")
    total: int = Field(..., description="Total number of images")

class ProductImageResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[ProductImageOut] = Field(None, description="Product image data")
