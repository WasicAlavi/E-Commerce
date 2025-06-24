from typing import List, Optional
from app.models.payment_method import PaymentMethod
from app.schemas.payment_method import PaymentMethodCreate, PaymentMethodUpdate, PaymentMethodOut

async def create_payment_method(payment_data: PaymentMethodCreate) -> PaymentMethod:
    """Create a new payment method"""
    return await PaymentMethod.create(
        customer_id=payment_data.customer_id,
        account_no=payment_data.account_no,
        type=payment_data.type,
        is_default=payment_data.is_default
    )

async def get_payment_method_by_id(payment_id: int) -> Optional[PaymentMethod]:
    """Get payment method by ID"""
    return await PaymentMethod.get_by_id(payment_id)

async def get_payment_methods_by_customer(customer_id: int) -> List[PaymentMethod]:
    """Get payment methods by customer ID"""
    return await PaymentMethod.get_by_customer_id(customer_id)

async def get_default_payment_method(customer_id: int) -> Optional[PaymentMethod]:
    """Get default payment method for customer"""
    return await PaymentMethod.get_default_by_customer_id(customer_id)

async def get_payment_methods(skip: int = 0, limit: int = 100) -> List[PaymentMethod]:
    """Get all payment methods with pagination"""
    return await PaymentMethod.get_all(skip=skip, limit=limit)

async def update_payment_method(payment_id: int, payment_data: PaymentMethodUpdate) -> Optional[PaymentMethod]:
    """Update payment method"""
    payment = await PaymentMethod.get_by_id(payment_id)
    if not payment:
        return None
    
    update_data = {}
    if payment_data.account_no is not None:
        update_data['account_no'] = payment_data.account_no
    if payment_data.type is not None:
        update_data['type'] = payment_data.type
    if payment_data.is_default is not None:
        update_data['is_default'] = payment_data.is_default
    
    return await payment.update(**update_data)

async def delete_payment_method(payment_id: int) -> bool:
    """Delete payment method"""
    payment = await PaymentMethod.get_by_id(payment_id)
    if not payment:
        return False
    return await payment.delete()

async def set_default_payment_method(payment_id: int) -> Optional[PaymentMethod]:
    """Set payment method as default"""
    payment = await PaymentMethod.get_by_id(payment_id)
    if not payment:
        return None
    return await payment.set_as_default()

async def get_payment_methods_by_type(customer_id: int, payment_type: str) -> List[PaymentMethod]:
    """Get payment methods by type for a customer"""
    return await PaymentMethod.get_by_type(customer_id, payment_type)

async def validate_payment_method(payment_id: int, customer_id: int) -> bool:
    """Validate if payment method belongs to customer"""
    return await PaymentMethod.validate_ownership(payment_id, customer_id) 