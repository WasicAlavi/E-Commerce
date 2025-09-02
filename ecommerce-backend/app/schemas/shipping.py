from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ShippingUpdate(BaseModel):
    courier_service: str = Field(..., description="Name of the courier service")
    tracking_id: str = Field(..., description="Tracking ID from the courier service")
    estimated_delivery: Optional[str] = Field(None, description="Estimated delivery date")
    notes: Optional[str] = Field(None, description="Additional shipping notes")

class ShippingInfo(BaseModel):
    id: int
    order_id: int
    courier_service: str
    tracking_id: str
    estimated_delivery: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

class ShippingInfoCreate(BaseModel):
    order_id: int
    courier_service: str = Field(..., description="Name of the courier service")
    tracking_id: str = Field(..., description="Tracking ID from the courier service")
    estimated_delivery: Optional[str] = Field(None, description="Estimated delivery date")
    notes: Optional[str] = Field(None, description="Additional shipping notes")

class ShippingInfoUpdate(BaseModel):
    courier_service: Optional[str] = Field(None, description="Name of the courier service")
    tracking_id: Optional[str] = Field(None, description="Tracking ID from the courier service")
    estimated_delivery: Optional[str] = Field(None, description="Estimated delivery date")
    notes: Optional[str] = Field(None, description="Additional shipping notes") 