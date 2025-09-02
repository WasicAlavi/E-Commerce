from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr, validator
from app.schemas.address import AddressOut
from app.schemas.user import UserOut
from datetime import date

class CustomerBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None

    @validator('date_of_birth', pre=True)
    def validate_date_of_birth(cls, v):
        if v == "" or v is None:
            return None
        if isinstance(v, str):
            try:
                return date.fromisoformat(v)
            except ValueError:
                raise ValueError('Invalid date format. Use YYYY-MM-DD')
        return v

    @validator('gender')
    def validate_gender(cls, v):
        if v is not None and v not in ['Male', 'Female', 'Other']:
            raise ValueError('Gender must be Male, Female, or Other')
        return v

class CustomerCreate(CustomerBase):
    user_id: int

class CustomerUpdate(CustomerBase):
    pass

class CustomerOut(CustomerBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class CustomerProfileOut(BaseModel):
    id: int
    user_id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None

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
