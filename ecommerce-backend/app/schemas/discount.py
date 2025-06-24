from pydantic import BaseModel, Field, validator
from datetime import date, datetime
from enum import Enum
from typing import Optional, List

class DiscountType(str, Enum):
    PERCENTAGE = "percentage"   
    FIXED = "fixed"             

class DiscountBase(BaseModel):
    discount_type: DiscountType = Field(..., description="Type of discount")
    value: float = Field(..., gt=0, description="Discount value")
    start_date: date = Field(..., description="Start date of discount")
    end_date: date = Field(..., description="End date of discount")

    @validator('value')
    def validate_value(cls, v):
        if v <= 0:
            raise ValueError('Discount value must be greater than 0')
        return v

    @validator('end_date')
    def validate_end_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('End date must be after start date')
        return v

class DiscountCreate(DiscountBase):
    product_id: int = Field(..., description="ID of the product")

class DiscountUpdate(BaseModel):
    discount_type: Optional[DiscountType] = Field(None, description="Type of discount")
    value: Optional[float] = Field(None, gt=0, description="Discount value")
    start_date: Optional[date] = Field(None, description="Start date of discount")
    end_date: Optional[date] = Field(None, description="End date of discount")

    @validator('value')
    def validate_value(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Discount value must be greater than 0')
        return v

class DiscountOut(DiscountBase):
    id: int = Field(..., description="Discount ID")
    product_id: int = Field(..., description="ID of the product")

    class Config:
        from_attributes = True

class DiscountWithProduct(DiscountOut):
    product_name: str = Field(..., description="Product name")
    original_price: float = Field(..., description="Original product price")
    discounted_price: float = Field(..., description="Price after discount")

class DiscountList(BaseModel):
    discounts: List[DiscountOut] = Field(..., description="List of discounts")
    total: int = Field(..., description="Total number of discounts")

class ActiveDiscountList(BaseModel):
    active_discounts: List[DiscountWithProduct] = Field(..., description="List of active discounts")
    total: int = Field(..., description="Total number of active discounts")

class DiscountResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[DiscountOut] = Field(None, description="Discount data")
