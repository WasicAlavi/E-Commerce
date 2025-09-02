from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DeliveryAssignmentBase(BaseModel):
    order_id: int
    rider_id: int
    status: str = "pending"
    estimated_delivery: Optional[datetime] = None
    delivery_notes: Optional[str] = None

class DeliveryAssignmentCreate(DeliveryAssignmentBase):
    pass

class DeliveryAssignmentUpdate(BaseModel):
    status: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    delivery_notes: Optional[str] = None
    rejection_reason: Optional[str] = None

class OrderDetails(BaseModel):
    secure_order_id: str
    total_price: float
    status: str
    transaction_id: Optional[str] = None

class DeliveryAssignmentWithOrderDetails(BaseModel):
    id: int
    order_id: int
    rider_id: int
    assigned_at: datetime
    status: str
    accepted_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    delivery_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    secure_assignment_id: Optional[str] = None
    order_details: Optional[OrderDetails] = None

class DeliveryAssignmentResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class DeliveryAssignmentList(BaseModel):
    assignments: List[DeliveryAssignmentWithOrderDetails]
    total: int 