from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.crud import payment_crud
from app.schemas.payment_method import (
    PaymentMethodCreate, PaymentMethodUpdate, PaymentMethodOut, 
    PaymentMethodList, PaymentMethodResponse
)

router = APIRouter(prefix="/payment-methods", tags=["payment-methods"])

@router.post("/", response_model=PaymentMethodResponse)
async def create_payment_method(payment_data: PaymentMethodCreate):
    """Create a new payment method"""
    try:
        payment = await payment_crud.create_payment_method(payment_data)
        return PaymentMethodResponse(
            success=True,
            message="Payment method created successfully",
            data=payment
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{payment_id}", response_model=PaymentMethodResponse)
async def get_payment_method(payment_id: int):
    """Get payment method by ID"""
    payment = await payment_crud.get_payment_method_by_id(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    return PaymentMethodResponse(
        success=True,
        message="Payment method retrieved successfully",
        data=payment
    )

@router.get("/customer/{customer_id}", response_model=List[PaymentMethodOut])
async def get_payment_methods_by_customer(customer_id: int):
    """Get payment methods by customer ID"""
    payments = await payment_crud.get_payment_methods_by_customer(customer_id)
    return payments

@router.get("/customer/{customer_id}/default", response_model=PaymentMethodResponse)
async def get_default_payment_method(customer_id: int):
    """Get default payment method for customer"""
    payment = await payment_crud.get_default_payment_method(customer_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Default payment method not found")
    
    return PaymentMethodResponse(
        success=True,
        message="Default payment method retrieved successfully",
        data=payment
    )

@router.get("/", response_model=PaymentMethodList)
async def get_payment_methods(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all payment methods with pagination"""
    payments = await payment_crud.get_payment_methods(skip=skip, limit=limit)
    total = len(payments)
    
    return PaymentMethodList(
        payment_methods=payments,
        total=total,
        skip=skip,
        limit=limit
    )

@router.put("/{payment_id}", response_model=PaymentMethodResponse)
async def update_payment_method(payment_id: int, payment_data: PaymentMethodUpdate):
    """Update payment method"""
    payment = await payment_crud.update_payment_method(payment_id, payment_data)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    return PaymentMethodResponse(
        success=True,
        message="Payment method updated successfully",
        data=payment
    )

@router.delete("/{payment_id}")
async def delete_payment_method(payment_id: int):
    """Delete payment method"""
    success = await payment_crud.delete_payment_method(payment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    return {"success": True, "message": "Payment method deleted successfully"}

@router.post("/{payment_id}/set-default", response_model=PaymentMethodResponse)
async def set_default_payment_method(payment_id: int):
    """Set payment method as default"""
    payment = await payment_crud.set_default_payment_method(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    return PaymentMethodResponse(
        success=True,
        message="Payment method set as default successfully",
        data=payment
    )

@router.get("/customer/{customer_id}/type/{payment_type}", response_model=List[PaymentMethodOut])
async def get_payment_methods_by_type(customer_id: int, payment_type: str):
    """Get payment methods by type for a customer"""
    payments = await payment_crud.get_payment_methods_by_type(customer_id, payment_type)
    return payments

@router.get("/{payment_id}/validate/{customer_id}")
async def validate_payment_method(payment_id: int, customer_id: int):
    """Validate if payment method belongs to customer"""
    is_valid = await payment_crud.validate_payment_method(payment_id, customer_id)
    return {
        "success": True,
        "message": "Payment method validation completed",
        "data": {"is_valid": is_valid}
    } 