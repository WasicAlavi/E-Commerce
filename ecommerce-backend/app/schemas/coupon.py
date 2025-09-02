from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum
from typing import Optional, List

class DiscountType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"

class CouponBase(BaseModel):
    code: str = Field(..., min_length=3, max_length=50, description="Coupon code")
    discount_type: DiscountType = Field(..., description="Type of discount")
    value: float = Field(..., gt=0, description="Discount value")
    usage_limit: int = Field(..., gt=0, description="Maximum number of times coupon can be used")
    used: int = Field(default=0, ge=0, description="Number of times coupon has been used")
    valid_from: datetime = Field(..., description="Start date and time of coupon validity")
    valid_until: datetime = Field(..., description="End date and time of coupon validity")
    is_active: Optional[bool] = Field(default=True, description="Whether coupon is active")

    @validator('value')
    def validate_value(cls, v):
        if v <= 0:
            raise ValueError('Coupon value must be greater than 0')
        return v

    @validator('usage_limit')
    def validate_usage_limit(cls, v):
        if v <= 0:
            raise ValueError('Usage limit must be greater than 0')
        return v

    @validator('used')
    def validate_used(cls, v):
        if v < 0:
            raise ValueError('Used count cannot be negative')
        return v

    @validator('valid_until')
    def validate_valid_until(cls, v, values):
        if 'valid_from' in values and v <= values['valid_from']:
            raise ValueError('Valid until must be after valid from')
        return v

    @validator('valid_from', 'valid_until')
    def validate_datetime_timezone(cls, v):
        """Ensure datetime is timezone-naive for database storage"""
        if v and v.tzinfo is not None:
            return v.replace(tzinfo=None)
        return v

    @validator('code')
    def validate_code(cls, v):
        if not v.strip():
            raise ValueError('Coupon code cannot be empty')
        return v.strip().upper()

class CouponCreate(CouponBase):
    pass

class CouponUpdate(BaseModel):
    code: Optional[str] = Field(None, min_length=3, max_length=50, description="Coupon code")
    discount_type: Optional[DiscountType] = Field(None, description="Type of discount")
    value: Optional[float] = Field(None, gt=0, description="Discount value")
    usage_limit: Optional[int] = Field(None, gt=0, description="Maximum number of times coupon can be used")
    valid_from: Optional[datetime] = Field(None, description="Start date and time of coupon validity")
    valid_until: Optional[datetime] = Field(None, description="End date and time of coupon validity")
    is_active: Optional[bool] = Field(None, description="Whether coupon is active")

    @validator('value')
    def validate_value(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Coupon value must be greater than 0')
        return v

    @validator('usage_limit')
    def validate_usage_limit(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Usage limit must be greater than 0')
        return v

    @validator('valid_from', 'valid_until')
    def validate_datetime_timezone(cls, v):
        """Ensure datetime is timezone-naive for database storage"""
        if v and v.tzinfo is not None:
            return v.replace(tzinfo=None)
        return v

    @validator('code')
    def validate_code(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Coupon code cannot be empty')
        return v.strip().upper() if v else v

class CouponOut(CouponBase):
    id: int = Field(..., description="Coupon ID")

    class Config:
        from_attributes = True

class CouponValidation(BaseModel):
    code: str = Field(..., description="Coupon code to validate")
    order_total: float = Field(..., gt=0, description="Order total amount")
    customer_id: Optional[int] = Field(None, description="Customer ID for validation")

class CouponValidationResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Validation message")
    data: Optional[dict] = Field(None, description="Validation data")

class CouponList(BaseModel):
    coupons: List[CouponOut] = Field(..., description="List of coupons")
    total: int = Field(..., description="Total number of coupons")
    skip: int = Field(..., description="Number of coupons skipped")
    limit: int = Field(..., description="Maximum number of coupons returned")

class ActiveCouponList(BaseModel):
    active_coupons: List[CouponOut] = Field(..., description="List of active coupons")
    total: int = Field(..., description="Total number of active coupons")

class CouponResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[CouponOut] = Field(None, description="Coupon data")
