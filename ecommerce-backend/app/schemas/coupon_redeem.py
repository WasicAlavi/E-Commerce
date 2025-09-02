# app/schemas/coupon_redeem.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class CouponRedeemBase(BaseModel):
    coupon_id: int = Field(..., description="ID of the coupon")
    customer_id: int = Field(..., description="ID of the customer")
    order_id: int = Field(..., description="ID of the order")
    redeemed_at: datetime = Field(..., description="Date and time when coupon was redeemed")

class CouponRedeemCreate(BaseModel):
    coupon_id: int = Field(..., description="ID of the coupon")
    customer_id: int = Field(..., description="ID of the customer")
    order_id: int = Field(..., description="ID of the order")
    discount_amount: float = Field(..., description="Discount amount applied")
    redeemed_at: Optional[datetime] = Field(None, description="Date and time when coupon was redeemed")

class CouponRedeemOut(CouponRedeemBase):
    id: int = Field(..., description="Coupon redeem ID")

    class Config:
        from_attributes = True

class CouponRedeemWithDetails(CouponRedeemOut):
    coupon_code: str = Field(..., description="Coupon code")
    discount_type: str = Field(..., description="Type of discount")
    discount_value: float = Field(..., description="Discount value")
    order_total: Optional[float] = Field(None, description="Order total amount")

class CouponRedeemList(BaseModel):
    redeems: List[CouponRedeemOut] = Field(..., description="List of coupon redeems")
    total: int = Field(..., description="Total number of redeems")

class CustomerCouponHistory(BaseModel):
    customer_id: int = Field(..., description="ID of the customer")
    coupon_history: List[CouponRedeemWithDetails] = Field(..., description="Customer's coupon usage history")
    total_redeems: int = Field(..., description="Total number of coupon redeems by customer")

class CouponRedeemResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[CouponRedeemOut] = Field(None, description="Coupon redeem data")
