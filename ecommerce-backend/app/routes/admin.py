from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.order import Order
from app.models.admin import Admin
from app.models.user import User
from app.models.shipping import ShippingInfo
from app.schemas.shipping import ShippingUpdate
from app.services.email_service import email_service
from app.database import get_db_connection
from app.utils.jwt_utils import get_current_admin

router = APIRouter(prefix="/admin", tags=["admin"])

# Get all orders with details for admin
@router.get("/orders")
async def get_all_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    current_admin: dict = Depends(get_current_admin)
):
    """Get all orders with details for admin dashboard"""
    try:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            if status:
                query = """
                    SELECT o.id, o.customer_id, o.order_date, o.total_price, o.address_id, o.payment_id, o.status,
                           o.secure_order_id,
                           c.first_name, c.last_name, u.email, c.phone
                    FROM orders o
                    LEFT JOIN customers c ON o.customer_id = c.id
                    LEFT JOIN users u ON c.user_id = u.id
                    WHERE o.status = $1
                    ORDER BY o.order_date DESC LIMIT $2 OFFSET $3
                """
                params = [status, limit, skip]
            else:
                query = """
                    SELECT o.id, o.customer_id, o.order_date, o.total_price, o.address_id, o.payment_id, o.status,
                           o.secure_order_id,
                           c.first_name, c.last_name, u.email, c.phone
                    FROM orders o
                    LEFT JOIN customers c ON o.customer_id = c.id
                    LEFT JOIN users u ON c.user_id = u.id
                    ORDER BY o.order_date DESC LIMIT $1 OFFSET $2
                """
                params = [limit, skip]
            
            rows = await conn.fetch(query, *params)
            
            orders_with_details = []
            for row in rows:
                order_data = dict(row)
                
                # Get order items
                items = await conn.fetch("""
                    SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price,
                           p.name as product_name,
                           COALESCE(pi.image_url, 'https://via.placeholder.com/100x100?text=No+Image') as product_image
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.id
                    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                    WHERE oi.order_id = $1
                """, order_data['id'])
                
                order_data['items'] = [dict(item) for item in items]
                
                # Get address details
                address = await conn.fetchrow("""
                    SELECT id, street, city, division, country, postal_code
                    FROM addresses
                    WHERE id = $1
                """, order_data['address_id'])
                
                order_data['address'] = dict(address) if address else None
                
                # Get payment method details
                if order_data['payment_id']:
                    payment = await conn.fetchrow("""
                        SELECT id, method_name
                        FROM payment_methods
                        WHERE id = $1
                    """, order_data['payment_id'])
                    order_data['payment_method'] = payment['method_name'] if payment else None
                else:
                    order_data['payment_method'] = None
                
                orders_with_details.append(order_data)
            
            return {
                "success": True,
                "message": "Orders retrieved successfully",
                "data": orders_with_details,
                "total": len(orders_with_details),
                "skip": skip,
                "limit": limit
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving orders: {str(e)}")

# Update order status
@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: int, status_update: Dict[str, Any], current_admin: dict = Depends(get_current_admin)):
    """Update order status (admin only)"""
    try:
        new_status = status_update.get('status')
        if not new_status:
            raise HTTPException(status_code=400, detail="Status is required")
        
        # Validate status value
        valid_statuses = ['pending', 'approved', 'shipped', 'delivered', 'cancelled']
        new_status_lower = new_status.lower()
        if new_status_lower not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status '{new_status}'. Must be one of: {', '.join(valid_statuses)}"
            )
        
        # Get the order
        order = await Order.get_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Check if status transition is valid (optional business logic)
        if order.status == 'cancelled' and new_status_lower != 'cancelled':
            raise HTTPException(
                status_code=400,
                detail="Cannot change status of a cancelled order"
            )
        
        # Update the status using a direct SQL query to bypass trigger issues
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            try:
                # Use a direct UPDATE with RETURNING to bypass any trigger issues
                # Try to use a transaction to isolate the update
                async with conn.transaction():
                    row = await conn.fetchrow("""
                        UPDATE orders 
                        SET status = $1
                        WHERE id = $2
                        RETURNING id, customer_id, order_date, total_price, address_id, payment_id, status, secure_order_id, transaction_id
                    """, new_status_lower, order_id)
                    
                    if not row:
                        raise HTTPException(status_code=404, detail="Order not found")
                    
                    updated_order = Order(**dict(row))
                
            except Exception as e:
                # If there's still an issue, try to provide more specific error handling
                if "admin_id" in str(e):
                    # This is likely a trigger issue, try to provide a helpful error message
                    raise HTTPException(status_code=500, detail="Database trigger issue detected. Please contact administrator.")
                else:
                    raise HTTPException(status_code=500, detail=f"Error updating order status: {str(e)}")
        
        # If status is being changed to "Shipped", handle shipping details
        if new_status_lower == "shipped":
            shipping_data = status_update.get('shipping')
            if shipping_data:
                courier_service = shipping_data.get('courier_service')
                tracking_id = shipping_data.get('tracking_id')
                estimated_delivery = shipping_data.get('estimated_delivery')
                notes = shipping_data.get('notes')
                
                if not courier_service or not tracking_id:
                    raise HTTPException(status_code=400, detail="Courier service and tracking ID are required for shipping")
                
                # Check if rider is assigned
                rider_id = shipping_data.get('rider_id')
                if not rider_id:
                    raise HTTPException(status_code=400, detail="Rider assignment is required for shipping")
                
                # Create or update shipping info
                existing_shipping = await ShippingInfo.get_by_order_id(order_id)
                if existing_shipping:
                    shipping_info = await existing_shipping.update(
                        courier_service=courier_service,
                        tracking_id=tracking_id,
                        estimated_delivery=estimated_delivery,
                        notes=notes
                    )
                else:
                    shipping_info = await ShippingInfo.create(
                        order_id=order_id,
                        courier_service=courier_service,
                        tracking_id=tracking_id,
                        estimated_delivery=estimated_delivery,
                        notes=notes
                    )
                
                # Send email notification to customer
                try:
                    # Get customer details
                    pool = await get_db_connection()
                    async with pool.acquire() as conn:
                        customer_data = await conn.fetchrow("""
                            SELECT c.first_name, c.last_name, u.email
                            FROM customers c
                            LEFT JOIN users u ON c.user_id = u.id
                            WHERE c.id = $1
                        """, order.customer_id)
                    
                    if customer_data:
                        customer_name = f"{customer_data['first_name']} {customer_data['last_name']}"
                        customer_email = customer_data['email']
                        
                        # Send shipping notification email
                        email_sent = email_service.send_shipping_notification(
                            customer_email=customer_email,
                            customer_name=customer_name,
                            order_id=order.secure_order_id or str(order.id),
                            courier_service=courier_service,
                            tracking_id=tracking_id,
                            estimated_delivery=estimated_delivery
                        )
                        
                        if email_sent:
                            print(f"Shipping notification email sent to {customer_email}")
                        else:
                            print(f"Failed to send shipping notification email to {customer_email}")
                
                except Exception as email_error:
                    print(f"Error sending shipping notification email: {email_error}")
                    # Don't fail the entire request if email fails
                
                # Assign rider to the order
                try:
                    from app.models.delivery_assignment import DeliveryAssignment
                    from app.schemas.delivery_assignment import DeliveryAssignmentCreate
                    
                    # Check if order already has a delivery assignment
                    existing_assignment = await DeliveryAssignment.get_by_order_id(order_id)
                    if existing_assignment:
                        print(f"Order {order_id} already has a delivery assignment")
                    else:
                        # Create new delivery assignment
                        assignment_data = DeliveryAssignmentCreate(
                            order_id=order_id,
                            rider_id=rider_id,
                            status="pending",
                            estimated_delivery=estimated_delivery,
                            delivery_notes=notes
                        )
                        
                        # Import rider_crud to create the assignment
                        from app.crud import rider_crud
                        assignment = await rider_crud.create_delivery_assignment(assignment_data)
                        
                        if assignment:
                            print(f"Successfully assigned rider {rider_id} to order {order_id}")
                        else:
                            print(f"Failed to assign rider {rider_id} to order {order_id}")
                
                except Exception as assignment_error:
                    print(f"Error assigning rider to order: {assignment_error}")
                    # Don't fail the entire request if rider assignment fails
        
        # If status is being changed to "delivered", send delivery notification
        if new_status_lower == "delivered":
            try:
                # Get customer details
                pool = await get_db_connection()
                async with pool.acquire() as conn:
                    customer_data = await conn.fetchrow("""
                        SELECT c.first_name, c.last_name, u.email
                        FROM customers c
                        LEFT JOIN users u ON c.user_id = u.id
                        WHERE c.id = $1
                    """, order.customer_id)
                
                if customer_data:
                    customer_name = f"{customer_data['first_name']} {customer_data['last_name']}"
                    customer_email = customer_data['email']
                    
                    # Format delivery date
                    delivery_date = datetime.now().strftime('%B %d, %Y at %I:%M %p')
                    
                    # Send delivery notification email
                    email_sent = email_service.send_delivery_notification(
                        customer_email=customer_email,
                        customer_name=customer_name,
                        order_id=order.secure_order_id or str(order.id),
                        delivery_date=delivery_date
                    )
                    
                    if email_sent:
                        print(f"Delivery notification email sent to {customer_email}")
                    else:
                        print(f"Failed to send delivery notification email to {customer_email}")
            
            except Exception as email_error:
                print(f"Error sending delivery notification email: {email_error}")
                # Don't fail the entire request if email fails
        
        return {
            "success": True,
            "message": f"Order status updated to {new_status}",
            "data": updated_order.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating order status: {str(e)}")

# Get order statistics
@router.get("/orders/stats")
async def get_order_statistics(current_admin: dict = Depends(get_current_admin)):
    """Get order statistics for admin dashboard"""
    try:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Get total orders
            total_orders = await conn.fetchval("SELECT COUNT(*) FROM orders")
            
            # Get orders by status
            status_counts = await conn.fetch("""
                SELECT status, COUNT(*) as count
                FROM orders
                GROUP BY status
            """)
            
            # Get total revenue
            total_revenue = await conn.fetchval("SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE status != 'cancelled'")
            
            # Get recent orders (last 7 days)
            recent_orders = await conn.fetchval("""
                SELECT COUNT(*) FROM orders 
                WHERE order_date >= CURRENT_DATE - INTERVAL '7 days'
            """)
            
            # Get last month's revenue (actually last 30 days)
            last_month_revenue = await conn.fetchval("""
                SELECT COALESCE(SUM(total_price), 0) FROM orders
                WHERE status != 'cancelled'
                AND order_date >= (CURRENT_DATE - INTERVAL '30 days')
            """)

            # Debug: print last_month_revenue
            print('DEBUG: last_month_revenue (last 30 days):', last_month_revenue)

            # Debug: print number of orders in last 30 days
            last_30_days_orders = await conn.fetch("""
                SELECT id, total_price, order_date, status FROM orders
                WHERE order_date >= (CURRENT_DATE - INTERVAL '30 days')
            """)
            print('DEBUG: Orders in last 30 days:', [dict(row) for row in last_30_days_orders])
            
            stats = {
                "total_orders": total_orders,
                "total_revenue": float(total_revenue) if total_revenue else 0.0,
                "recent_orders": recent_orders,
                "status_breakdown": {row['status']: row['count'] for row in status_counts},
                "lastMonthRevenue": float(last_month_revenue) if last_month_revenue else 0.0
            }
            
            return {
                "success": True,
                "message": "Order statistics retrieved successfully",
                "data": stats
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving order statistics: {str(e)}")

# Get single order with full details for admin
@router.get("/orders/{order_id}")
async def get_order_details(order_id: int, current_admin: dict = Depends(get_current_admin)):
    """Get single order with full details for admin"""
    try:
        order_data = await Order.get_by_id_with_details(order_id)
        if not order_data:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Get shipping information if available
        shipping_info = await ShippingInfo.get_by_order_id(order_id)
        if shipping_info:
            order_data['shipping_info'] = shipping_info.to_dict()
        
        return {
            "success": True,
            "message": "Order details retrieved successfully",
            "data": order_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving order details: {str(e)}")

# Get shipping information for an order
@router.get("/orders/{order_id}/shipping")
async def get_order_shipping(order_id: int, current_admin: dict = Depends(get_current_admin)):
    """Get shipping information for an order"""
    try:
        shipping_info = await ShippingInfo.get_by_order_id(order_id)
        if not shipping_info:
            raise HTTPException(status_code=404, detail="Shipping information not found")
        
        return {
            "success": True,
            "message": "Shipping information retrieved successfully",
            "data": shipping_info.to_dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving shipping information: {str(e)}")

# Get delivery assignment information for an order
@router.get("/orders/{order_id}/delivery-assignment")
async def get_order_delivery_assignment(order_id: int, current_admin: dict = Depends(get_current_admin)):
    """Get delivery assignment information for an order"""
    try:
        from app.crud import rider_crud
        
        # Get delivery assignment
        assignment = await rider_crud.get_delivery_assignment_by_order_id(order_id)
        if not assignment:
            return {
                "success": True,
                "message": "No delivery assignment found for this order",
                "data": None
            }
        
        # Get rider details
        rider = await rider_crud.get_rider_with_user_info(assignment.rider_id)
        
        assignment_data = assignment.to_dict()
        assignment_data['rider_details'] = rider
        
        return {
            "success": True,
            "message": "Delivery assignment retrieved successfully",
            "data": assignment_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving delivery assignment: {str(e)}")

# Assign rider to an order (without changing status)
@router.post("/orders/{order_id}/assign-rider")
async def assign_rider_to_order(order_id: int, assignment_data: Dict[str, Any], current_admin: dict = Depends(get_current_admin)):
    """Assign a rider to an order without changing the order status"""
    try:
        rider_id = assignment_data.get('rider_id')
        if not rider_id:
            raise HTTPException(status_code=400, detail="Rider ID is required")
        
        # Get the order
        order = await Order.get_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Check if order already has a delivery assignment
        from app.models.delivery_assignment import DeliveryAssignment
        existing_assignment = await DeliveryAssignment.get_by_order_id(order_id)
        if existing_assignment:
            # Update existing assignment
            updated_assignment = await existing_assignment.update_status("pending")
            if updated_assignment:
                print(f"Updated existing delivery assignment for order {order_id}")
            else:
                raise HTTPException(status_code=500, detail="Failed to update existing delivery assignment")
        else:
            # Create new delivery assignment
            from app.schemas.delivery_assignment import DeliveryAssignmentCreate
            from app.crud import rider_crud
            
            new_assignment_data = DeliveryAssignmentCreate(
                order_id=order_id,
                rider_id=rider_id,
                status="pending",
                estimated_delivery=assignment_data.get('estimated_delivery'),
                delivery_notes=assignment_data.get('delivery_notes', f"Assigned by admin")
            )
            
            assignment = await rider_crud.create_delivery_assignment(new_assignment_data)
            if not assignment:
                raise HTTPException(status_code=500, detail="Failed to create delivery assignment")
            
            print(f"Successfully assigned rider {rider_id} to order {order_id}")
        
        return {
            "success": True,
            "message": f"Rider assigned to order successfully",
            "data": {
                "order_id": order_id,
                "rider_id": rider_id,
                "status": "pending"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error assigning rider to order: {str(e)}")

# Get all riders for admin
@router.get("/riders")
async def get_all_riders_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_admin: dict = Depends(get_current_admin)
):
    """Get all riders with user information for admin dashboard"""
    try:
        from app.crud import rider_crud
        
        riders = await rider_crud.get_all_riders_with_user_info(skip=skip, limit=limit)
        
        return {
            "success": True,
            "message": "Riders retrieved successfully",
            "riders": riders,
            "total": len(riders),
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving riders: {str(e)}")

# Get active riders for admin
@router.get("/riders/active")
async def get_active_riders_admin(current_admin: dict = Depends(get_current_admin)):
    """Get all active riders for admin dashboard"""
    try:
        from app.crud import rider_crud
        
        riders = await rider_crud.get_active_riders_with_user_info()
        
        return {
            "success": True,
            "message": "Active riders retrieved successfully",
            "riders": riders,
            "total": len(riders)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving active riders: {str(e)}")

# Get riders by zone for admin
@router.get("/riders/zone/{zone}")
async def get_riders_by_zone_admin(zone: str, current_admin: dict = Depends(get_current_admin)):
    """Get riders by delivery zone for admin dashboard"""
    try:
        from app.crud import rider_crud
        
        riders = await rider_crud.get_riders_by_zone_with_user_info(zone)
        
        return {
            "success": True,
            "message": f"Riders in zone {zone} retrieved successfully",
            "riders": riders,
            "total": len(riders)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving riders by zone: {str(e)}") 