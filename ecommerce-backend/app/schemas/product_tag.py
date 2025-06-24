# app/schemas/product_tag.py

from pydantic import BaseModel, Field
from typing import Optional, List

class ProductTagBase(BaseModel):
    product_id: int = Field(..., description="ID of the product")
    tag_id: int = Field(..., description="ID of the tag")

class ProductTagCreate(ProductTagBase):
    pass

class ProductTagUpdate(BaseModel):
    product_id: Optional[int] = Field(None, description="ID of the product")
    tag_id: Optional[int] = Field(None, description="ID of the tag")

class ProductTagOut(ProductTagBase):
    id: int = Field(..., description="Product tag ID")

    class Config:
        from_attributes = True

class ProductTagWithDetails(ProductTagOut):
    product_name: str = Field(..., description="Product name")
    tag_name: str = Field(..., description="Tag name")

class ProductTagList(BaseModel):
    product_tags: List[ProductTagOut] = Field(..., description="List of product tags")
    total: int = Field(..., description="Total number of product tags")

class ProductTagResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[ProductTagOut] = Field(None, description="Product tag data")
