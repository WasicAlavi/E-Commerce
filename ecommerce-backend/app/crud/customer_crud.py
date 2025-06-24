from typing import List, Optional
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerOut

async def create_customer(customer_data: CustomerCreate) -> Customer:
    """Create a new customer"""
    return await Customer.create(
        user_id=customer_data.user_id
    )

async def get_customer_by_id(customer_id: int) -> Optional[Customer]:
    """Get customer by ID"""
    return await Customer.get_by_id(customer_id)

async def get_customer_by_user_id(user_id: int) -> Optional[Customer]:
    """Get customer by user ID"""
    return await Customer.get_by_user_id(user_id)

async def get_customers(skip: int = 0, limit: int = 100) -> List[Customer]:
    """Get all customers with pagination"""
    return await Customer.get_all(skip=skip, limit=limit)

async def update_customer(customer_id: int, customer_data: CustomerUpdate) -> Optional[Customer]:
    """Update customer"""
    customer = await Customer.get_by_id(customer_id)
    if not customer:
        return None
    
    update_data = {}
    if customer_data.phone is not None:
        update_data['phone'] = customer_data.phone
    if customer_data.date_of_birth is not None:
        update_data['date_of_birth'] = customer_data.date_of_birth
    if customer_data.gender is not None:
        update_data['gender'] = customer_data.gender
    
    return await customer.update(**update_data)

async def delete_customer(customer_id: int) -> bool:
    """Delete customer"""
    customer = await Customer.get_by_id(customer_id)
    if not customer:
        return False
    return await customer.delete()

async def get_customer_with_user_details(customer_id: int) -> Optional[dict]:
    """Get customer with user details"""
    return await Customer.get_with_user_details(customer_id)

async def get_customer_statistics(customer_id: int) -> Optional[dict]:
    """Get customer statistics"""
    return await Customer.get_statistics(customer_id)

async def search_customers(search_term: str, skip: int = 0, limit: int = 100) -> List[Customer]:
    """Search customers by name or email"""
    return await Customer.search(search_term, skip=skip, limit=limit) 