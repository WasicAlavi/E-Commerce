from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.crud import rider_crud
from app.schemas.rider import (
    RiderCreate, RiderUpdate, RiderOut, RiderList, RiderResponse,
    DeliveryAssignmentCreate, DeliveryAssignmentUpdate, DeliveryAssignmentOut,
    DeliveryAssignmentList, DeliveryAssignmentResponse, RiderStats, ZoneInfo
)
from app.utils.jwt_utils import get_current_user

router = APIRouter(prefix="/riders", tags=["riders"])

@router.get("/test-auth")
async def test_auth(current_user: dict = Depends(get_current_user)):
    """Test authentication endpoint"""
    
    # Check if user exists in database
    from app.models.user import User
    user = await User.get_by_id(current_user["user_id"])
    
    # Check if user has customer profile
    from app.models.customer import Customer
    customer = await Customer.get_by_user_id(current_user["user_id"])
    
    # Check if user is a rider
    rider = await rider_crud.get_rider_by_user_id(current_user["user_id"])
    
    return {
        "success": True,
        "message": "Authentication working",
        "user": current_user,
        "user_in_db": user.to_dict() if user else None,
        "customer": customer.to_dict() if customer else None,
        "rider": rider.to_dict() if rider else None
    }

@router.post("/register", response_model=RiderResponse)
async def register_as_rider(rider_data: RiderCreate, current_user: dict = Depends(get_current_user)):
    """Register as a rider"""
    try:
        # Check if user is already a rider
        existing_rider = await rider_crud.get_rider_by_user_id(current_user["user_id"])
        if existing_rider:
            raise HTTPException(status_code=400, detail="User is already registered as a rider")
        
        # Get customer_id from customer table
        from app.models.customer import Customer
        customer = await Customer.get_by_user_id(current_user["user_id"])
        if not customer:
            raise HTTPException(status_code=404, detail="Customer profile not found. Please complete your profile first.")
        
        # Create new rider
        rider = await rider_crud.create_rider(
            rider_data=rider_data,
            user_id=current_user["user_id"],
            customer_id=customer.id
        )
        
        return RiderResponse(
            success=True,
            message="Successfully registered as rider",
            data=rider
        )
    except Exception as e:
        import traceback
        print(f"DEBUG: Exception in register_as_rider: {str(e)}")
        print(f"DEBUG: Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profile", response_model=RiderResponse)
async def get_rider_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's rider profile"""
    
    # Check if user exists first
    from app.models.user import User
    user = await User.get_by_id(current_user["user_id"])
    
    # Let's also check what riders exist in the database
    from app.models.rider import Rider
    all_riders = await Rider.get_all()
    
    rider = await rider_crud.get_rider_by_user_id(current_user["user_id"])
    
    if not rider:
        raise HTTPException(status_code=404, detail="Rider profile not found")
    
    return RiderResponse(
        success=True,
        message="Rider profile retrieved successfully",
        data=rider
    )

@router.put("/profile", response_model=RiderResponse)
async def update_rider_profile(rider_data: RiderUpdate, current_user: dict = Depends(get_current_user)):
    """Update current user's rider profile"""
    rider = await rider_crud.get_rider_by_user_id(current_user["user_id"])
    if not rider:
        raise HTTPException(status_code=404, detail="Rider profile not found")
    
    updated_rider = await rider_crud.update_rider(rider.id, rider_data)
    if not updated_rider:
        raise HTTPException(status_code=400, detail="Failed to update rider profile")
    
    return RiderResponse(
        success=True,
        message="Rider profile updated successfully",
        data=updated_rider
    )

@router.get("/deliveries")
async def get_rider_deliveries(current_user: dict = Depends(get_current_user)):
    """Get current rider's delivery assignments"""
    rider = await rider_crud.get_rider_by_user_id(current_user["user_id"])
    
    if not rider:
        raise HTTPException(status_code=404, detail="Rider profile not found")
    
    assignments = await rider_crud.get_delivery_assignments_by_rider_id(rider.id)
    
    # Convert assignments to dictionaries with order details
    assignments_list = []
    for assignment in assignments:
        # Get order details to include secure order ID
        from app.models.order import Order
        order = await Order.get_by_id(assignment.order_id)
        
        order_details = None
        if order:
            order_details = {
                "secure_order_id": order.secure_order_id,
                "total_price": float(order.total_price),
                "status": order.status,
                "transaction_id": order.transaction_id
            }
        
        # Create the assignment dictionary with order details
        assignment_dict = {
            "id": assignment.id,
            "order_id": assignment.order_id,
            "rider_id": assignment.rider_id,
            "assigned_at": assignment.assigned_at,
            "status": assignment.status,
            "accepted_at": assignment.accepted_at,
            "rejected_at": assignment.rejected_at,
            "rejection_reason": assignment.rejection_reason,
            "estimated_delivery": assignment.estimated_delivery,
            "actual_delivery": assignment.actual_delivery,
            "delivery_notes": assignment.delivery_notes,
            "created_at": assignment.created_at,
            "updated_at": assignment.updated_at,
            "secure_assignment_id": assignment.secure_assignment_id,
            "order_details": order_details
        }
        
        assignments_list.append(assignment_dict)
    
    return {
        "assignments": assignments_list,
        "total": len(assignments)
    }

@router.post("/deliveries/{assignment_id}/accept", response_model=DeliveryAssignmentResponse)
async def accept_delivery(
    assignment_id: int,
    accept_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Accept a delivery assignment"""
    # Extract data from request body
    estimated_delivery = accept_data.get("estimated_delivery")
    
    # Verify the assignment belongs to the current rider
    rider = await rider_crud.get_rider_by_user_id(current_user["user_id"])
    if not rider:
        raise HTTPException(status_code=404, detail="Rider profile not found")
    
    assignment = await rider_crud.get_delivery_assignment_by_id(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Delivery assignment not found")
    
    if assignment.rider_id != rider.id:
        raise HTTPException(status_code=403, detail="Not authorized to accept this delivery")
    
    if assignment.status != 'pending':
        raise HTTPException(status_code=400, detail="Delivery can only be accepted when status is 'pending'")
    
    # Convert estimated_delivery string to datetime if provided
    from datetime import datetime
    estimated_delivery_dt = None
    if estimated_delivery:
        try:
            estimated_delivery_dt = datetime.fromisoformat(estimated_delivery.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid estimated_delivery format")
    
    updated_assignment = await assignment.accept_delivery(estimated_delivery_dt)
    if not updated_assignment:
        raise HTTPException(status_code=400, detail="Failed to accept delivery")
    
    return DeliveryAssignmentResponse(
        success=True,
        message="Delivery accepted successfully",
        data=updated_assignment.to_dict()
    )

@router.post("/deliveries/{assignment_id}/reject", response_model=DeliveryAssignmentResponse)
async def reject_delivery(
    assignment_id: int,
    reject_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Reject a delivery assignment"""
    # Extract data from request body
    rejection_reason = reject_data.get("rejection_reason")
    
    # Verify the assignment belongs to the current rider
    rider = await rider_crud.get_rider_by_user_id(current_user["user_id"])
    if not rider:
        raise HTTPException(status_code=404, detail="Rider profile not found")
    
    assignment = await rider_crud.get_delivery_assignment_by_id(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Delivery assignment not found")
    
    if assignment.rider_id != rider.id:
        raise HTTPException(status_code=403, detail="Not authorized to reject this delivery")
    
    if assignment.status != 'pending':
        raise HTTPException(status_code=400, detail="Delivery can only be rejected when status is 'pending'")
    
    updated_assignment = await assignment.reject_delivery(rejection_reason)
    if not updated_assignment:
        raise HTTPException(status_code=400, detail="Failed to reject delivery")
    
    return DeliveryAssignmentResponse(
        success=True,
        message="Delivery rejected successfully",
        data=updated_assignment.to_dict()
    )

@router.put("/deliveries/{assignment_id}/status", response_model=DeliveryAssignmentResponse)
async def update_delivery_status(
    assignment_id: int,
    status_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update delivery status"""
    # Extract data from request body
    status = status_data.get("status")
    delivery_notes = status_data.get("delivery_notes")
    
    if not status:
        raise HTTPException(status_code=400, detail="Status is required")
    
    # Verify the assignment belongs to the current rider
    rider = await rider_crud.get_rider_by_user_id(current_user["user_id"])
    if not rider:
        raise HTTPException(status_code=404, detail="Rider profile not found")
    
    assignment = await rider_crud.get_delivery_assignment_by_id(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Delivery assignment not found")
    
    if assignment.rider_id != rider.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this delivery")
    
    updated_assignment = await rider_crud.update_delivery_status(assignment_id, status, delivery_notes)
    if not updated_assignment:
        raise HTTPException(status_code=400, detail="Failed to update delivery status")
    
    # Send email notification if status is "delivered"
    if status.lower() == "delivered":
        try:
            # Get order details
            from app.models.order import Order
            from app.models.customer import Customer
            from app.models.user import User
            from app.services.email_service import email_service
            
            order = await Order.get_by_id(assignment.order_id)
            if order:
                # Get customer details
                customer = await Customer.get_by_id(order.customer_id)
                user = await User.get_by_id(customer.user_id) if customer else None
                
                if customer and user:
                    # Format delivery date
                    delivery_date = updated_assignment.actual_delivery.strftime('%B %d, %Y at %I:%M %p') if updated_assignment.actual_delivery else None
                    
                    # Send delivery notification email
                    email_service.send_delivery_notification(
                        customer_email=user.email,
                        customer_name=f"{customer.first_name} {customer.last_name}".strip(),
                        order_id=order.secure_order_id,
                        delivery_date=delivery_date
                    )
        except Exception as e:
            print(f"Error sending delivery notification email: {e}")
            # Don't fail the request if email fails
    
    return DeliveryAssignmentResponse(
        success=True,
        message=f"Delivery status updated to {status}",
        data=updated_assignment.to_dict()
    )

# Admin routes
@router.get("/", response_model=RiderList)
async def get_all_riders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user)
):
    """Get all riders (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    riders = await rider_crud.get_all_riders_with_user_info(skip=skip, limit=limit)
    
    return RiderList(
        riders=riders,
        total=len(riders)
    )

@router.get("/active", response_model=RiderList)
async def get_active_riders(current_user: dict = Depends(get_current_user)):
    """Get all active riders (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    riders = await rider_crud.get_active_riders()
    
    # Convert riders to dict with user info
    riders_with_info = []
    for rider in riders:
        rider_dict = rider.to_dict()
        # Get user and customer info
        from app.models.user import User
        from app.models.customer import Customer
        
        user = await User.get_by_id(rider.user_id)
        customer = await Customer.get_by_id(rider.customer_id)
        
        rider_dict.update({
            "user_name": f"{customer.first_name} {customer.last_name}".strip() if customer else "N/A",
            "user_email": user.email if user else "N/A",
            "user_phone": customer.phone if customer else "N/A"
        })
        
        riders_with_info.append(rider_dict)
    
    return RiderList(
        riders=riders_with_info,
        total=len(riders_with_info)
    )

@router.get("/zone/{zone}", response_model=RiderList)
async def get_riders_by_zone(zone: str, current_user: dict = Depends(get_current_user)):
    """Get riders available for a specific zone (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    riders = await rider_crud.get_riders_by_zone(zone)
    
    # Convert riders to include user information
    from app.models.user import User
    from app.models.customer import Customer
    
    riders_with_info = []
    for rider in riders:
        user = await User.get_by_id(rider.user_id)
        customer = await Customer.get_by_id(rider.customer_id)
        
        rider_dict = rider.to_dict()
        rider_dict.update({
            "user_name": f"{customer.first_name} {customer.last_name}".strip() if customer else "N/A",
            "user_email": user.email if user else "N/A",
            "user_phone": customer.phone if customer else "N/A"
        })
        
        riders_with_info.append(rider_dict)
    
    return RiderList(
        riders=riders_with_info,
        total=len(riders_with_info)
    )

# Delivery Assignment routes (must come before /{rider_id} routes)
@router.post("/assign", response_model=DeliveryAssignmentResponse)
async def assign_delivery(assignment_data: DeliveryAssignmentCreate, current_user: dict = Depends(get_current_user)):
    """Assign delivery to rider (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if order already has an assignment
    existing_assignment = await rider_crud.get_delivery_assignment_by_order_id(assignment_data.order_id)
    if existing_assignment:
        raise HTTPException(status_code=400, detail="Order already has a delivery assignment")
    
    assignment = await rider_crud.create_delivery_assignment(assignment_data)
    
    return DeliveryAssignmentResponse(
        success=True,
        message="Delivery assigned successfully",
        data=assignment.to_dict()
    )

@router.get("/assignments", response_model=DeliveryAssignmentList)
async def get_all_assignments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user)
):
    """Get all delivery assignments (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    assignments = await rider_crud.get_all_delivery_assignments(skip=skip, limit=limit)
    
    # Convert assignments to dictionaries
    assignments_dict = [assignment.to_dict() for assignment in assignments]
    
    return DeliveryAssignmentList(
        assignments=assignments_dict,
        total=len(assignments)
    )

@router.get("/assignments/active", response_model=DeliveryAssignmentList)
async def get_active_assignments(current_user: dict = Depends(get_current_user)):
    """Get active delivery assignments (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    assignments = await rider_crud.get_active_delivery_assignments()
    
    # Convert assignments to dictionaries
    assignments_dict = [assignment.to_dict() for assignment in assignments]
    
    return DeliveryAssignmentList(
        assignments=assignments_dict,
        total=len(assignments)
    )

@router.get("/assignments/{assignment_id}", response_model=DeliveryAssignmentResponse)
async def get_assignment_by_id(assignment_id: int, current_user: dict = Depends(get_current_user)):
    """Get delivery assignment by ID (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    assignment = await rider_crud.get_delivery_assignment_by_id(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Delivery assignment not found")
    
    return DeliveryAssignmentResponse(
        success=True,
        message="Delivery assignment retrieved successfully",
        data=assignment.to_dict()
    )

@router.put("/assignments/{assignment_id}", response_model=DeliveryAssignmentResponse)
async def update_assignment(
    assignment_id: int, 
    assignment_data: DeliveryAssignmentUpdate, 
    current_user: dict = Depends(get_current_user)
):
    """Update delivery assignment (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    assignment = await rider_crud.get_delivery_assignment_by_id(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Delivery assignment not found")
    
    if assignment_data.status:
        updated_assignment = await rider_crud.update_delivery_status(
            assignment_id, assignment_data.status, assignment_data.delivery_notes
        )
        
        # Send email notification if status is "delivered"
        if assignment_data.status.lower() == "delivered":
            try:
                # Get order details
                from app.models.order import Order
                from app.models.customer import Customer
                from app.models.user import User
                from app.services.email_service import email_service
                
                order = await Order.get_by_id(assignment.order_id)
                if order:
                    # Get customer details
                    customer = await Customer.get_by_id(order.customer_id)
                    user = await User.get_by_id(customer.user_id) if customer else None
                    
                    if customer and user:
                        # Format delivery date
                        delivery_date = updated_assignment.actual_delivery.strftime('%B %d, %Y at %I:%M %p') if updated_assignment.actual_delivery else None
                        
                        # Send delivery notification email
                        email_service.send_delivery_notification(
                            customer_email=user.email,
                            customer_name=f"{customer.first_name} {customer.last_name}".strip(),
                            order_id=order.secure_order_id,
                            delivery_date=delivery_date
                        )
            except Exception as e:
                print(f"Error sending delivery notification email: {e}")
                # Don't fail the request if email fails
                
    elif assignment_data.estimated_delivery:
        updated_assignment = await rider_crud.update_estimated_delivery(
            assignment_id, assignment_data.estimated_delivery
        )
    else:
        raise HTTPException(status_code=400, detail="No valid update data provided")
    
    if not updated_assignment:
        raise HTTPException(status_code=400, detail="Failed to update delivery assignment")
    
    return DeliveryAssignmentResponse(
        success=True,
        message="Delivery assignment updated successfully",
        data=updated_assignment.to_dict()
    )

@router.delete("/assignments/{assignment_id}")
async def delete_assignment(assignment_id: int, current_user: dict = Depends(get_current_user)):
    """Delete delivery assignment (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    success = await rider_crud.delete_delivery_assignment(assignment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Delivery assignment not found")
    
    return {"success": True, "message": "Delivery assignment deleted successfully"}

@router.get("/{rider_id}/deliveries")
async def get_rider_deliveries_by_id(rider_id: int, current_user: dict = Depends(get_current_user)):
    """Get deliveries for a specific rider (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if rider exists
    rider = await rider_crud.get_rider_by_id(rider_id)
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    
    assignments = await rider_crud.get_delivery_assignments_by_rider_id(rider_id)
    
    # Convert assignments to dictionaries with order details
    assignments_list = []
    for assignment in assignments:
        # Get order details to include secure order ID
        from app.models.order import Order
        order = await Order.get_by_id(assignment.order_id)
        
        order_details = None
        if order:
            order_details = {
                "secure_order_id": order.secure_order_id,
                "total_price": float(order.total_price),
                "status": order.status,
                "transaction_id": order.transaction_id
            }
        
        # Create the assignment dictionary with order details
        assignment_dict = {
            "id": assignment.id,
            "order_id": assignment.order_id,
            "rider_id": assignment.rider_id,
            "assigned_at": assignment.assigned_at,
            "status": assignment.status,
            "accepted_at": assignment.accepted_at,
            "rejected_at": assignment.rejected_at,
            "rejection_reason": assignment.rejection_reason,
            "estimated_delivery": assignment.estimated_delivery,
            "actual_delivery": assignment.actual_delivery,
            "delivery_notes": assignment.delivery_notes,
            "created_at": assignment.created_at,
            "updated_at": assignment.updated_at,
            "secure_assignment_id": assignment.secure_assignment_id,
            "order_details": order_details
        }
        
        assignments_list.append(assignment_dict)
    
    return {
        "assignments": assignments_list,
        "total": len(assignments)
    }

@router.get("/{rider_id}", response_model=RiderResponse)
async def get_rider_by_id(rider_id: int, current_user: dict = Depends(get_current_user)):
    """Get rider by ID (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    rider = await rider_crud.get_rider_by_id(rider_id)
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    
    return RiderResponse(
        success=True,
        message="Rider retrieved successfully",
        data=rider
    )

@router.put("/{rider_id}", response_model=RiderResponse)
async def update_rider(rider_id: int, rider_data: RiderUpdate, current_user: dict = Depends(get_current_user)):
    """Update rider (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    updated_rider = await rider_crud.update_rider(rider_id, rider_data)
    if not updated_rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    
    return RiderResponse(
        success=True,
        message="Rider updated successfully",
        data=updated_rider
    )

@router.post("/{rider_id}/activate", response_model=RiderResponse)
async def activate_rider(rider_id: int, current_user: dict = Depends(get_current_user)):
    """Activate a rider (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    rider = await rider_crud.activate_rider(rider_id)
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    
    return RiderResponse(
        success=True,
        message="Rider activated successfully",
        data=rider
    )

@router.post("/{rider_id}/deactivate", response_model=RiderResponse)
async def deactivate_rider(rider_id: int, current_user: dict = Depends(get_current_user)):
    """Deactivate a rider (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    rider = await rider_crud.deactivate_rider(rider_id)
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    
    return RiderResponse(
        success=True,
        message="Rider deactivated successfully",
        data=rider
    )

 