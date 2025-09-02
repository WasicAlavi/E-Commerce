# app/routers/address.py

from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.crud import address as address_crud
from app.schemas.address import AddressCreate, AddressOut

router = APIRouter(prefix="/addresses", tags=["addresses"])

@router.post("/", response_model=AddressOut)
async def create_address(address_data: AddressCreate):
    """Create a new address"""
    try:
        address = await address_crud.create_address(address_data)
        return address
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{address_id}", response_model=AddressOut)
async def get_address(address_id: int):
    """Get address by ID"""
    address = await address_crud.get_address_by_id(address_id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return address

@router.get("/customer/{customer_id}", response_model=List[AddressOut])
async def get_addresses_by_customer(customer_id: int):
    """Get all addresses for a customer"""
    print(f"Fetching addresses for customer_id: {customer_id}")
    addresses = await address_crud.get_addresses_by_customer(customer_id)
    print(f"Found addresses: {addresses}")
    return addresses

@router.put("/{address_id}", response_model=AddressOut)
async def update_address(address_id: int, address_data: AddressCreate):
    """Update address"""
    address = await address_crud.update_address(address_id, address_data)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return address

@router.delete("/{address_id}")
async def delete_address(address_id: int):
    """Delete address"""
    success = await address_crud.delete_address(address_id)
    if not success:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"success": True, "message": "Address deleted successfully"}

@router.post("/{customer_id}/set-default/{address_id}")
async def set_default_address(customer_id: int, address_id: int):
    """Set an address as default for a customer"""
    success = await address_crud.set_default_address(customer_id, address_id)
    if not success:
        raise HTTPException(status_code=404, detail="Could not set default address")
    return {"success": True, "message": "Default address set successfully"}
