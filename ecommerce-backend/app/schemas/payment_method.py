from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime

class PaymentType(str, Enum):
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PAYPAL = "paypal"
    UPI = "upi"


class PaymentMethodBase(BaseModel):
    account_no: str = Field(..., description="Payment account number or identifier")
    is_default: bool = Field(default=False, description="Whether this is the default payment method")
    type: PaymentType = Field(..., description="Type of payment method")

class PaymentMethodCreate(PaymentMethodBase):
    customer_id: int = Field(..., description="ID of the customer")

class PaymentMethodUpdate(BaseModel):
    account_no: Optional[str] = Field(None, description="Payment account number or identifier")
    is_default: Optional[bool] = Field(None, description="Whether this is the default payment method")
    type: Optional[PaymentType] = Field(None, description="Type of payment method")

class PaymentMethodOut(PaymentMethodBase):
    id: int = Field(..., description="Payment method ID")
    customer_id: int = Field(..., description="ID of the customer")

    class Config:
        from_attributes = True

class PaymentMethodList(BaseModel):
    payment_methods: List[PaymentMethodOut] = Field(..., description="List of payment methods")
    total: int = Field(..., description="Total number of payment methods")

class PaymentMethodResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[PaymentMethodOut] = Field(None, description="Payment method data")
