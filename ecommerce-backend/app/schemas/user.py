from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: EmailStr = Field(..., description="Email address")

    @validator('username')
    def validate_username(cls, v):
        if not v.strip():
            raise ValueError('Username cannot be empty')
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return v.strip()

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Password")

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="Username")
    email: Optional[EmailStr] = Field(None, description="Email address")
    password: Optional[str] = Field(None, min_length=8, description="Password")

    @validator('username')
    def validate_username(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('Username cannot be empty')
            if not v.replace('_', '').replace('-', '').isalnum():
                raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
            return v.strip()
        return v

    @validator('password')
    def validate_password(cls, v):
        if v is not None and len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserOut(UserBase):
    id: int = Field(..., description="User ID")
    role: Optional[str] = Field(None, description="User role")
    created_at: Optional[datetime] = Field(None, description="User creation date")

    class Config:
        from_attributes = True

class UserList(BaseModel):
    users: List[UserOut] = Field(..., description="List of users")
    total: int = Field(..., description="Total number of users")

class UserResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[UserOut] = Field(None, description="User data")

class UserLogin(BaseModel):
    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="Password")

class UserLoginResponse(BaseModel):
    success: bool = Field(..., description="Login success status")
    message: str = Field(..., description="Login message")
    user: Optional[UserOut] = Field(None, description="User data")
    token: Optional[str] = Field(None, description="Authentication token")


