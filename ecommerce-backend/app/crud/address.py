from typing import List, Optional
from app.models.address import Address
from app.schemas.address import AddressCreate, AddressOut

async def create_address(address_data: AddressCreate) -> Address:
    """Create a new address"""
    return await Address.create(
        customer_id=address_data.customer_id,
        street=address_data.street,
        city=address_data.city,
        division=address_data.division,
        country=address_data.country,
        postal_code=address_data.postal_code
    )

async def get_address_by_id(address_id: int) -> Optional[Address]:
    """Get address by ID"""
    return await Address.get_by_id(address_id)

async def get_addresses_by_customer(customer_id: int) -> List[Address]:
    """Get all addresses for a customer"""
    return await Address.get_by_customer_id(customer_id)

async def update_address(address_id: int, address_data: AddressCreate) -> Optional[Address]:
    """Update address"""
    address = await Address.get_by_id(address_id)
    if not address:
        return None
    update_data = address_data.dict(exclude_unset=True)
    return await address.update(**update_data)

async def delete_address(address_id: int) -> bool:
    """Delete address"""
    address = await Address.get_by_id(address_id)
    if not address:
        return False
    return await address.delete()
