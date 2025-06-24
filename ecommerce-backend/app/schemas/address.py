from typing import List, Optional
from pydantic import BaseModel, Field, validator

class AddressBase(BaseModel):
    street: str = Field(..., min_length=1, max_length=200, description="Street address")
    city: str = Field(..., min_length=1, max_length=100, description="City")
    division: str = Field(..., min_length=1, max_length=100, description="State/Province/Division")
    country: str = Field(..., min_length=1, max_length=100, description="Country")
    postal_code: str = Field(..., min_length=1, max_length=20, description="Postal/ZIP code")

    @validator('street', 'city', 'division', 'country')
    def validate_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()

    @validator('postal_code')
    def validate_postal_code(cls, v):
        if not v.strip():
            raise ValueError('Postal code cannot be empty')
        return v.strip()

class AddressCreate(AddressBase):
    customer_id: int = Field(..., description="ID of the customer")

class AddressUpdate(BaseModel):
    street: Optional[str] = Field(None, min_length=1, max_length=200, description="Street address")
    city: Optional[str] = Field(None, min_length=1, max_length=100, description="City")
    division: Optional[str] = Field(None, min_length=1, max_length=100, description="State/Province/Division")
    country: Optional[str] = Field(None, min_length=1, max_length=100, description="Country")
    postal_code: Optional[str] = Field(None, min_length=1, max_length=20, description="Postal/ZIP code")

    @validator('street', 'city', 'division', 'country')
    def validate_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip() if v else v

    @validator('postal_code')
    def validate_postal_code(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Postal code cannot be empty')
        return v.strip() if v else v

class AddressOut(AddressBase):
    id: int = Field(..., description="Address ID")
    customer_id: int = Field(..., description="ID of the customer")

    class Config:
        from_attributes = True

class AddressList(BaseModel):
    addresses: List[AddressOut] = Field(..., description="List of addresses")
    total: int = Field(..., description="Total number of addresses")

class AddressResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[AddressOut] = Field(None, description="Address data")
