from typing import List, Optional
from app.models.coupon import Coupon
from app.models.coupon_redeem import CouponRedeem
from app.schemas.coupon import CouponCreate, CouponUpdate, CouponOut, CouponValidation
from app.schemas.coupon_redeem import CouponRedeemCreate

async def create_coupon(coupon_data: CouponCreate) -> Coupon:
    """Create a new coupon"""
    return await Coupon.create(
        code=coupon_data.code,
        discount_type=coupon_data.discount_type,
        value=coupon_data.value,
        usage_limit=coupon_data.usage_limit,
        valid_from=coupon_data.valid_from,
        valid_until=coupon_data.valid_until,
        is_active=coupon_data.is_active
    )

async def get_coupon_by_id(coupon_id: int) -> Optional[Coupon]:
    """Get coupon by ID"""
    return await Coupon.get_by_id(coupon_id)

async def get_coupon_by_code(code: str) -> Optional[Coupon]:
    """Get coupon by code"""
    return await Coupon.get_by_code(code)

async def get_coupons(skip: int = 0, limit: int = 100) -> List[Coupon]:
    """Get all coupons with pagination"""
    return await Coupon.get_all(skip=skip, limit=limit)

async def get_active_coupons() -> List[Coupon]:
    """Get all active coupons"""
    return await Coupon.get_active()

async def update_coupon(coupon_id: int, coupon_data: CouponUpdate) -> Optional[Coupon]:
    """Update coupon"""
    coupon = await Coupon.get_by_id(coupon_id)
    if not coupon:
        return None
    
    update_data = {}
    if coupon_data.code is not None:
        update_data['code'] = coupon_data.code
    if coupon_data.discount_type is not None:
        update_data['discount_type'] = coupon_data.discount_type
    if coupon_data.value is not None:
        update_data['value'] = coupon_data.value
    if coupon_data.usage_limit is not None:
        update_data['usage_limit'] = coupon_data.usage_limit
    if coupon_data.valid_from is not None:
        update_data['valid_from'] = coupon_data.valid_from
    if coupon_data.valid_until is not None:
        update_data['valid_until'] = coupon_data.valid_until
    if coupon_data.is_active is not None:
        update_data['is_active'] = coupon_data.is_active
    
    return await coupon.update(**update_data)

async def delete_coupon(coupon_id: int) -> bool:
    """Delete coupon"""
    coupon = await Coupon.get_by_id(coupon_id)
    if not coupon:
        return False
    return await coupon.delete()

async def validate_coupon(validation_data: CouponValidation) -> dict:
    """Validate a coupon for a customer"""
    return await Coupon.validate_coupon(
        code=validation_data.code,
        customer_id=validation_data.customer_id,
        order_amount=validation_data.order_amount
    )

async def apply_coupon(coupon_code: str, order_amount: float) -> float:
    """Apply coupon discount to order amount"""
    return await Coupon.apply_discount(coupon_code, order_amount)

async def get_coupon_usage_stats(coupon_id: int) -> dict:
    """Get coupon usage statistics"""
    return await Coupon.get_usage_stats(coupon_id)

async def activate_coupon(coupon_id: int) -> Optional[Coupon]:
    """Activate a coupon"""
    coupon = await Coupon.get_by_id(coupon_id)
    if not coupon:
        return None
    return await coupon.activate()

async def deactivate_coupon(coupon_id: int) -> Optional[Coupon]:
    """Deactivate a coupon"""
    coupon = await Coupon.get_by_id(coupon_id)
    if not coupon:
        return None
    return await coupon.deactivate()

async def get_expired_coupons() -> List[Coupon]:
    """Get expired coupons"""
    return await Coupon.get_expired()

async def get_upcoming_coupons() -> List[Coupon]:
    """Get upcoming coupons"""
    return await Coupon.get_upcoming()

# Coupon Redeem CRUD operations
async def redeem_coupon(redeem_data: CouponRedeemCreate) -> CouponRedeem:
    """Redeem a coupon"""
    return await CouponRedeem.create(
        coupon_id=redeem_data.coupon_id,
        customer_id=redeem_data.customer_id,
        order_id=redeem_data.order_id,
        discount_amount=redeem_data.discount_amount
    )

async def get_coupon_redemptions(coupon_id: int) -> List[CouponRedeem]:
    """Get redemptions for a coupon"""
    return await CouponRedeem.get_by_coupon_id(coupon_id)

async def get_customer_coupon_history(customer_id: int) -> List[CouponRedeem]:
    """Get coupon redemption history for a customer"""
    return await CouponRedeem.get_by_customer_id(customer_id)

async def check_coupon_already_redeemed(coupon_id: int, customer_id: int) -> bool:
    """Check if customer has already redeemed this coupon"""
    return await CouponRedeem.check_already_redeemed(coupon_id, customer_id) 