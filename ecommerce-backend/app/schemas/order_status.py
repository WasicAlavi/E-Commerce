from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum
from typing import Optional, List

class StatusEnum(str, Enum):        
    PENDING = "pending"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class OrderStatusBase(BaseModel):
    order_id: int = Field(..., description="ID of the order")
    admin_id: int = Field(..., description="ID of the admin")
    status: StatusEnum = Field(..., description="Order status")
    update_date: datetime = Field(..., description="Status update date")

class OrderStatusCreate(BaseModel):
    order_id: int = Field(..., description="ID of the order")
    admin_id: int = Field(..., description="ID of the admin")
    status: StatusEnum = Field(..., description="Order status")
    update_date: Optional[datetime] = Field(None, description="Status update date")

class OrderStatusUpdate(BaseModel):
    status: StatusEnum = Field(..., description="New order status")
    admin_id: Optional[int] = Field(None, description="ID of the admin")

class OrderStatusOut(OrderStatusBase):
    id: int = Field(..., description="Order status ID")

    class Config:
        from_attributes = True

class OrderStatusWithDetails(OrderStatusOut):
    order_total: float = Field(..., description="Order total amount")
    admin_name: str = Field(..., description="Admin name")

class OrderStatusList(BaseModel):
    statuses: List[OrderStatusOut] = Field(..., description="List of order statuses")
    total: int = Field(..., description="Total number of status updates")

class OrderStatusResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[OrderStatusOut] = Field(None, description="Order status data")
