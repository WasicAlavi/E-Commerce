from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional, List

class AdminRole(str, Enum):
    PRODUCT = "product"
    SALES = "sales"
    SUPERADMIN = "superadmin"

class AdminBase(BaseModel):
    admin_role: AdminRole = Field(..., description="Admin role")

class AdminCreate(BaseModel):
    user_id: int = Field(..., description="ID of the user to make admin")
    admin_role: AdminRole = Field(..., description="Admin role")

class AdminUpdate(BaseModel):
    admin_role: AdminRole = Field(..., description="New admin role")

class AdminOut(AdminBase):
    id: int = Field(..., description="Admin ID")
    user_id: int = Field(..., description="ID of the user")

    class Config:
        from_attributes = True

class AdminWithUserDetails(AdminOut):
    username: str = Field(..., description="Username")
    email: str = Field(..., description="Email address")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")

class AdminList(BaseModel):
    admins: List[AdminWithUserDetails] = Field(..., description="List of admins with user details")
    total: int = Field(..., description="Total number of admins")

class AdminRoleList(BaseModel):
    admins: List[AdminWithUserDetails] = Field(..., description="List of admins with specific role")
    role: AdminRole = Field(..., description="Admin role")
    total: int = Field(..., description="Total number of admins with this role")

class AdminResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[AdminOut] = Field(None, description="Admin data")

class AdminPermissionCheck(BaseModel):
    user_id: int = Field(..., description="ID of the user to check")
    required_role: AdminRole = Field(..., description="Required admin role")

class AdminPermissionResponse(BaseModel):
    is_admin: bool = Field(..., description="Whether user is an admin")
    has_role: bool = Field(..., description="Whether user has the required role")
    current_role: Optional[AdminRole] = Field(None, description="Current admin role if any")
