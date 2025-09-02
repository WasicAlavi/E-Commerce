# app/schemas/rider.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class RiderBase(BaseModel):
    vehicle_type: str = Field(..., description="Type of vehicle (bike, car, etc.)")
    vehicle_number: Optional[str] = Field(None, description="Vehicle registration number")
    delivery_zones: List[str] = Field(default=[], description="List of delivery zones")

class RiderCreate(RiderBase):
    pass

class RiderUpdate(BaseModel):
    vehicle_type: Optional[str] = Field(None, description="Type of vehicle")
    vehicle_number: Optional[str] = Field(None, description="Vehicle registration number")
    delivery_zones: Optional[List[str]] = Field(None, description="List of delivery zones")
    is_active: Optional[bool] = Field(None, description="Rider active status")

class RiderOut(RiderBase):
    id: int = Field(..., description="Rider ID")
    user_id: int = Field(..., description="User ID")
    customer_id: int = Field(..., description="Customer ID")
    is_active: bool = Field(..., description="Rider active status")
    rating: float = Field(..., description="Rider rating")
    total_deliveries: int = Field(..., description="Total deliveries completed")
    created_at: datetime = Field(..., description="Registration date")
    updated_at: datetime = Field(..., description="Last update date")

    class Config:
        from_attributes = True

class RiderWithUserInfo(RiderOut):
    user_name: str = Field(..., description="User name")
    user_email: str = Field(..., description="User email")
    user_phone: Optional[str] = Field(None, description="User phone number")

class RiderList(BaseModel):
    riders: List[RiderWithUserInfo] = Field(..., description="List of riders")
    total: int = Field(..., description="Total number of riders")

class RiderResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[RiderOut] = Field(None, description="Rider data")

# Delivery Assignment Schemas
class DeliveryAssignmentBase(BaseModel):
    order_id: int = Field(..., description="Order ID")
    rider_id: int = Field(..., description="Rider ID")
    estimated_delivery: Optional[datetime] = Field(None, description="Estimated delivery time")
    delivery_notes: Optional[str] = Field(None, description="Delivery notes")

class DeliveryAssignmentCreate(DeliveryAssignmentBase):
    pass

class DeliveryAssignmentUpdate(BaseModel):
    status: Optional[str] = Field(None, description="Delivery status")
    estimated_delivery: Optional[datetime] = Field(None, description="Estimated delivery time")
    delivery_notes: Optional[str] = Field(None, description="Delivery notes")

class DeliveryAssignmentOut(DeliveryAssignmentBase):
    id: int = Field(..., description="Assignment ID")
    assigned_at: datetime = Field(..., description="Assignment date")
    status: str = Field(..., description="Delivery status")
    actual_delivery: Optional[datetime] = Field(None, description="Actual delivery time")
    created_at: datetime = Field(..., description="Creation date")
    updated_at: datetime = Field(..., description="Last update date")

    class Config:
        from_attributes = True

class DeliveryAssignmentWithDetails(DeliveryAssignmentOut):
    order_details: dict = Field(..., description="Order details")
    rider_details: dict = Field(..., description="Rider details")
    customer_details: dict = Field(..., description="Customer details")

class DeliveryAssignmentList(BaseModel):
    assignments: List[DeliveryAssignmentOut] = Field(..., description="List of assignments")
    total: int = Field(..., description="Total number of assignments")

class DeliveryAssignmentResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[DeliveryAssignmentOut] = Field(None, description="Assignment data")

# Rider Statistics
class RiderStats(BaseModel):
    total_riders: int = Field(..., description="Total number of riders")
    active_riders: int = Field(..., description="Number of active riders")
    total_deliveries: int = Field(..., description="Total deliveries completed")
    average_rating: float = Field(..., description="Average rider rating")
    deliveries_today: int = Field(..., description="Deliveries completed today")
    pending_assignments: int = Field(..., description="Pending delivery assignments")

# Zone Management
class ZoneInfo(BaseModel):
    zone_name: str = Field(..., description="Zone name")
    available_riders: int = Field(..., description="Number of available riders in zone")
    active_deliveries: int = Field(..., description="Active deliveries in zone")
    average_delivery_time: Optional[float] = Field(None, description="Average delivery time in minutes") 