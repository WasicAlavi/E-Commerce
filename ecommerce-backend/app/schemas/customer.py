from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.address import AddressOut
from app.schemas.user import UserOut

class CustomerBase(BaseModel):
    pass 

class CustomerCreate(BaseModel):
    user_id: int = Field(..., description="ID of the user")

class CustomerUpdate(BaseModel):
    user_id: Optional[int] = Field(None, description="ID of the user")

class CustomerOut(CustomerBase):
    id: int = Field(..., description="Customer ID")
    user_id: int = Field(..., description="ID of the user")
    addresses: Optional[List[AddressOut]] = Field(default=[], description="List of customer addresses")

    class Config:
        from_attributes = True

class CustomerWithUser(CustomerOut):
    user: UserOut = Field(..., description="User information")

class CustomerWithDetails(CustomerWithUser):
    total_orders: int = Field(..., description="Total number of orders")
    total_spent: float = Field(..., description="Total amount spent")
    last_order_date: Optional[str] = Field(None, description="Date of last order")

class CustomerList(BaseModel):
    customers: List[CustomerOut] = Field(..., description="List of customers")
    total: int = Field(..., description="Total number of customers")

class CustomerResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[CustomerOut] = Field(None, description="Customer data")
