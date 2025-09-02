from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.crud import customer_crud
from app.schemas.customer import (
    CustomerCreate, CustomerUpdate, CustomerOut, CustomerWithUser, 
    CustomerWithDetails, CustomerList, CustomerResponse, CustomerProfileOut
)
from app.models.customer import Customer
from app.models.user import User
from app.models.order import Order

router = APIRouter(prefix="/customers", tags=["customers"])

@router.post("/", response_model=CustomerResponse)
async def create_customer(customer_data: CustomerCreate):
    """Create a new customer"""
    try:
        customer = await customer_crud.create_customer(customer_data)
        return CustomerResponse(
            success=True,
            message="Customer created successfully",
            data=customer
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: int):
    """Get customer by ID"""
    customer = await customer_crud.get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return CustomerResponse(
        success=True,
        message="Customer retrieved successfully",
        data=customer
    )

@router.get("/user/{user_id}", response_model=CustomerResponse)
async def get_customer_by_user_id(user_id: int):
    """Get customer by user ID"""
    customer = await customer_crud.get_customer_by_user_id(user_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return CustomerResponse(
        success=True,
        message="Customer retrieved successfully",
        data=customer
    )

@router.get("/", response_model=CustomerList)
async def get_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all customers with pagination"""
    customers = await customer_crud.get_customers(skip=skip, limit=limit)
    total = len(customers)  # In a real app, you'd get total count separately
    
    return CustomerList(
        customers=customers,
        total=total,
        skip=skip,
        limit=limit
    )

@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(customer_id: int, customer_data: CustomerUpdate):
    """Update customer"""
    customer = await customer_crud.update_customer(customer_id, customer_data)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return CustomerResponse(
        success=True,
        message="Customer updated successfully",
        data=customer
    )

@router.delete("/{customer_id}")
async def delete_customer(customer_id: int):
    """Delete customer"""
    success = await customer_crud.delete_customer(customer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {"success": True, "message": "Customer deleted successfully"}

@router.get("/{customer_id}/with-user", response_model=dict)
async def get_customer_with_user_details(customer_id: int):
    """Get customer with user details"""
    customer_data = await customer_crud.get_customer_with_user_details(customer_id)
    if not customer_data:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {
        "success": True,
        "message": "Customer with user details retrieved successfully",
        "data": customer_data
    }

@router.get("/{customer_id}/statistics", response_model=dict)
async def get_customer_statistics(customer_id: int):
    """Get customer statistics"""
    stats = await customer_crud.get_customer_statistics(customer_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {
        "success": True,
        "message": "Customer statistics retrieved successfully",
        "data": stats
    }

@router.get("/search/", response_model=CustomerList)
async def search_customers(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Search customers by name or email"""
    customers = await customer_crud.search_customers(q, skip=skip, limit=limit)
    total = len(customers)
    
    return CustomerList(
        customers=customers,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/profile/{customer_id}", response_model=CustomerProfileOut)
async def get_customer_profile(customer_id: int):
    """Get customer profile with user information"""
    try:
        # Get customer data
        customer = await Customer.get_by_id(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Get user data
        user = await User.get_by_id(customer.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return CustomerProfileOut(
            id=customer.id,
            user_id=customer.user_id,
            first_name=customer.first_name,
            last_name=customer.last_name,
            phone=customer.phone,
            date_of_birth=customer.date_of_birth.strftime('%Y-%m-%d') if customer.date_of_birth else None,
            gender=customer.gender,
            email=user.email,
            username=user.username
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")

@router.put("/profile/{user_id}", response_model=CustomerProfileOut)
async def update_customer_profile(user_id: int, profile_data: CustomerUpdate):
    """Update customer profile"""
    try:
        print(f"Received profile update data: {profile_data}")  # Debug log
        
        # Get customer
        customer = await Customer.get_by_user_id(user_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        print(f"Current customer data: {customer.to_dict()}")  # Debug log
        
        # Update customer data
        updated_customer = await customer.update(
            first_name=profile_data.first_name,
            last_name=profile_data.last_name,
            phone=profile_data.phone,
            date_of_birth=profile_data.date_of_birth,
            gender=profile_data.gender
        )
        
        print(f"Updated customer data: {updated_customer.to_dict()}")  # Debug log
        
        # Get user data
        user = await User.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return CustomerProfileOut(
            id=updated_customer.id,
            user_id=updated_customer.user_id,
            first_name=updated_customer.first_name,
            last_name=updated_customer.last_name,
            phone=updated_customer.phone,
            date_of_birth=updated_customer.date_of_birth.strftime('%Y-%m-%d') if updated_customer.date_of_birth else None,
            gender=updated_customer.gender,
            email=user.email,
            username=user.username
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating profile: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.get("/orders/{customer_id}")
async def get_customer_orders(customer_id: int):
    """Get customer orders with details"""
    try:
        # Get customer data
        customer = await Customer.get_by_id(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Get orders with details
        orders = await Order.get_by_customer_id_with_details(customer.id)
        
        return {
            "success": True,
            "message": "Orders retrieved successfully",
            "data": orders
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(e)}") 