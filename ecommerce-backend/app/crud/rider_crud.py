from typing import List, Optional
from app.models.rider import Rider
from app.models.delivery_assignment import DeliveryAssignment
from app.schemas.rider import RiderCreate, RiderUpdate, DeliveryAssignmentCreate, DeliveryAssignmentUpdate

async def create_rider(rider_data: RiderCreate, user_id: int, customer_id: int) -> Rider:
    """Create a new rider"""
    return await Rider.create(
        user_id=user_id,
        customer_id=customer_id,
        vehicle_type=rider_data.vehicle_type,
        vehicle_number=rider_data.vehicle_number,
        delivery_zones=rider_data.delivery_zones
    )

async def get_rider_by_id(rider_id: int) -> Optional[Rider]:
    """Get rider by ID"""
    return await Rider.get_by_id(rider_id)

async def get_rider_by_user_id(user_id: int) -> Optional[Rider]:
    """Get rider by user ID"""
    return await Rider.get_by_user_id(user_id)

async def get_rider_by_customer_id(customer_id: int) -> Optional[Rider]:
    """Get rider by customer ID"""
    return await Rider.get_by_customer_id(customer_id)

async def get_all_riders(skip: int = 0, limit: int = 100) -> List[Rider]:
    """Get all riders with pagination"""
    return await Rider.get_all(skip=skip, limit=limit)

async def get_all_riders_with_user_info(skip: int = 0, limit: int = 100) -> List[dict]:
    """Get all riders with user information"""
    from app.models.user import User
    from app.models.customer import Customer
    
    riders = await Rider.get_all(skip=skip, limit=limit)
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
    
    return riders_with_info

async def get_active_riders() -> List[Rider]:
    """Get all active riders"""
    return await Rider.get_active_riders()

async def get_active_riders_with_user_info() -> List[dict]:
    """Get all active riders with user information"""
    riders = await Rider.get_active_riders()
    riders_with_info = []
    
    for rider in riders:
        rider_dict = rider.to_dict()
        
        # Get user information
        from app.models.user import User
        from app.models.customer import Customer
        
        user = await User.get_by_id(rider.user_id)
        customer = await Customer.get_by_id(rider.customer_id)
        
        rider_dict.update({
            "user_name": f"{customer.first_name} {customer.last_name}".strip() if customer else "Unknown",
            "user_email": user.email if user else "Unknown",
            "user_phone": customer.phone if customer else "Unknown"
        })
        
        riders_with_info.append(rider_dict)
    
    return riders_with_info

async def get_riders_by_zone(zone: str) -> List[Rider]:
    """Get riders available for a specific delivery zone"""
    return await Rider.get_riders_by_zone(zone)

async def get_riders_by_zone_with_user_info(zone: str) -> List[dict]:
    """Get riders by zone with user information"""
    riders = await Rider.get_riders_by_zone(zone)
    riders_with_info = []
    
    for rider in riders:
        rider_dict = rider.to_dict()
        
        # Get user information
        from app.models.user import User
        from app.models.customer import Customer
        
        user = await User.get_by_id(rider.user_id)
        customer = await Customer.get_by_id(rider.customer_id)
        
        rider_dict.update({
            "user_name": f"{customer.first_name} {customer.last_name}".strip() if customer else "Unknown",
            "user_email": user.email if user else "Unknown",
            "user_phone": customer.phone if customer else "Unknown"
        })
        
        riders_with_info.append(rider_dict)
    
    return riders_with_info

async def update_rider(rider_id: int, rider_data: RiderUpdate) -> Optional[Rider]:
    """Update rider information"""
    rider = await Rider.get_by_id(rider_id)
    if not rider:
        return None
    
    return await rider.update(
        vehicle_type=rider_data.vehicle_type,
        vehicle_number=rider_data.vehicle_number,
        delivery_zones=rider_data.delivery_zones,
        is_active=rider_data.is_active
    )

async def delete_rider(rider_id: int) -> bool:
    """Delete rider"""
    rider = await Rider.get_by_id(rider_id)
    if not rider:
        return False
    return await rider.delete()

async def activate_rider(rider_id: int) -> Optional[Rider]:
    """Activate a rider"""
    rider = await Rider.get_by_id(rider_id)
    if not rider:
        return None
    return await rider.update(is_active=True)

async def deactivate_rider(rider_id: int) -> Optional[Rider]:
    """Deactivate a rider"""
    rider = await Rider.get_by_id(rider_id)
    if not rider:
        return None
    return await rider.update(is_active=False)

async def increment_rider_deliveries(rider_id: int) -> Optional[Rider]:
    """Increment rider's total deliveries count"""
    rider = await Rider.get_by_id(rider_id)
    if not rider:
        return None
    return await rider.increment_deliveries()



# Delivery Assignment CRUD operations
async def create_delivery_assignment(assignment_data: DeliveryAssignmentCreate) -> DeliveryAssignment:
    """Create a new delivery assignment"""
    return await DeliveryAssignment.create(
        order_id=assignment_data.order_id,
        rider_id=assignment_data.rider_id,
        estimated_delivery=assignment_data.estimated_delivery,
        delivery_notes=assignment_data.delivery_notes
    )

async def get_delivery_assignment_by_id(assignment_id: int) -> Optional[DeliveryAssignment]:
    """Get delivery assignment by ID"""
    return await DeliveryAssignment.get_by_id(assignment_id)

async def get_delivery_assignment_by_order_id(order_id: int) -> Optional[DeliveryAssignment]:
    """Get delivery assignment by order ID"""
    return await DeliveryAssignment.get_by_order_id(order_id)

async def get_delivery_assignments_by_rider_id(rider_id: int) -> List[DeliveryAssignment]:
    """Get all delivery assignments for a rider"""
    return await DeliveryAssignment.get_by_rider_id(rider_id)

async def get_active_delivery_assignments() -> List[DeliveryAssignment]:
    """Get all active delivery assignments"""
    return await DeliveryAssignment.get_active_assignments()

async def get_all_delivery_assignments(skip: int = 0, limit: int = 100) -> List[DeliveryAssignment]:
    """Get all delivery assignments with pagination"""
    return await DeliveryAssignment.get_all(skip=skip, limit=limit)

async def update_delivery_status(assignment_id: int, status: str, delivery_notes: str = None) -> Optional[DeliveryAssignment]:
    """Update delivery status"""
    assignment = await DeliveryAssignment.get_by_id(assignment_id)
    if not assignment:
        return None
    
    updated_assignment = await assignment.update_status(status, delivery_notes)
    
    # If delivery is completed, increment rider's delivery count
    if status == 'delivered':
        await increment_rider_deliveries(assignment.rider_id)
    
    return updated_assignment

async def update_estimated_delivery(assignment_id: int, estimated_delivery) -> Optional[DeliveryAssignment]:
    """Update estimated delivery time"""
    assignment = await DeliveryAssignment.get_by_id(assignment_id)
    if not assignment:
        return None
    return await assignment.update_estimated_delivery(estimated_delivery)

async def cancel_delivery_assignment(assignment_id: int, delivery_notes: str = None) -> Optional[DeliveryAssignment]:
    """Cancel delivery assignment"""
    assignment = await DeliveryAssignment.get_by_id(assignment_id)
    if not assignment:
        return None
    return await assignment.cancel(delivery_notes)

async def delete_delivery_assignment(assignment_id: int) -> bool:
    """Delete delivery assignment"""
    assignment = await DeliveryAssignment.get_by_id(assignment_id)
    if not assignment:
        return False
    return await assignment.delete()

# Advanced queries
async def get_rider_with_user_info(rider_id: int) -> Optional[dict]:
    """Get rider with user information"""
    from app.models.user import User
    from app.models.customer import Customer
    
    rider = await Rider.get_by_id(rider_id)
    if not rider:
        return None
    
    user = await User.get_by_id(rider.user_id)
    customer = await Customer.get_by_id(rider.customer_id)
    
    if not user or not customer:
        return None
    
    rider_dict = rider.to_dict()
    rider_dict.update({
        "user_name": f"{customer.first_name} {customer.last_name}".strip(),
        "user_email": user.email,
        "user_phone": customer.phone
    })
    
    return rider_dict

async def get_delivery_assignment_with_details(assignment_id: int) -> Optional[dict]:
    """Get delivery assignment with order, rider, and customer details"""
    from app.models.order import Order
    from app.models.user import User
    from app.models.customer import Customer
    
    assignment = await DeliveryAssignment.get_by_id(assignment_id)
    if not assignment:
        return None
    
    order = await Order.get_by_id(assignment.order_id)
    rider = await Rider.get_by_id(assignment.rider_id)
    
    if not order or not rider:
        return None
    
    customer = await Customer.get_by_id(order.customer_id)
    rider_user = await User.get_by_id(rider.user_id)
    
    assignment_dict = assignment.to_dict()
    assignment_dict.update({
        "order_details": order.to_dict() if order else {},
        "rider_details": rider.to_dict() if rider else {},
        "customer_details": customer.to_dict() if customer else {},
        "rider_user_details": {
            "name": f"{customer.first_name} {customer.last_name}".strip() if customer else "",
            "email": rider_user.email if rider_user else "",
            "phone": customer.phone if customer else ""
        } if rider else {}
    })
    
    return assignment_dict 