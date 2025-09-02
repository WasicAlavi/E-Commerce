from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.crud import coupon_crud
from app.schemas.coupon import (
    CouponCreate, CouponUpdate, CouponOut, CouponValidation, 
    CouponValidationResponse, CouponList, ActiveCouponList, CouponResponse
)
from app.schemas.coupon_redeem import CouponRedeemCreate, CouponRedeemOut

router = APIRouter(prefix="/coupons", tags=["coupons"])

@router.post("/", response_model=CouponResponse)
async def create_coupon(coupon_data: CouponCreate):
    """Create a new coupon"""
    try:
        coupon = await coupon_crud.create_coupon(coupon_data)
        return CouponResponse(
            success=True,
            message="Coupon created successfully",
            data=coupon
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/validate", response_model=CouponValidationResponse)
async def validate_coupon(validation_data: CouponValidation):
    """Validate a coupon for a customer"""
    validation_result = await coupon_crud.validate_coupon(validation_data)
    return CouponValidationResponse(
        success=True,
        message="Coupon validation completed",
        data=validation_result
    )

@router.post("/redeem", response_model=dict)
async def redeem_coupon(redeem_data: CouponRedeemCreate):
    """Redeem a coupon"""
    try:
        redemption = await coupon_crud.redeem_coupon(redeem_data)
        return {
            "success": True,
            "message": "Coupon redeemed successfully",
            "data": redemption.to_dict()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/active/", response_model=ActiveCouponList)
async def get_active_coupons():
    """Get all active coupons"""
    coupons = await coupon_crud.get_active_coupons()
    return ActiveCouponList(
        coupons=coupons,
        total=len(coupons)
    )

@router.get("/expired/", response_model=List[CouponOut])
async def get_expired_coupons():
    """Get expired coupons"""
    coupons = await coupon_crud.get_expired_coupons()
    return coupons

@router.get("/upcoming/", response_model=List[CouponOut])
async def get_upcoming_coupons():
    """Get upcoming coupons"""
    coupons = await coupon_crud.get_upcoming_coupons()
    return coupons

@router.get("/code/{code}", response_model=CouponResponse)
async def get_coupon_by_code(code: str):
    """Get coupon by code"""
    coupon = await coupon_crud.get_coupon_by_code(code)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    return CouponResponse(
        success=True,
        message="Coupon retrieved successfully",
        data=coupon
    )

@router.get("/customer/{customer_id}/history", response_model=List[CouponRedeemOut])
async def get_customer_coupon_history(customer_id: int):
    """Get coupon redemption history for a customer"""
    redemptions = await coupon_crud.get_customer_coupon_history(customer_id)
    return redemptions

@router.get("/{coupon_id}", response_model=CouponResponse)
async def get_coupon(coupon_id: int):
    """Get coupon by ID"""
    coupon = await coupon_crud.get_coupon_by_id(coupon_id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    return CouponResponse(
        success=True,
        message="Coupon retrieved successfully",
        data=coupon
    )

@router.get("/", response_model=CouponList)
async def get_coupons(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all coupons with pagination"""
    coupons = await coupon_crud.get_coupons(skip=skip, limit=limit)
    total = len(coupons)
    
    return CouponList(
        coupons=coupons,
        total=total,
        skip=skip,
        limit=limit
    )

@router.put("/{coupon_id}", response_model=CouponResponse)
async def update_coupon(coupon_id: int, coupon_data: CouponUpdate):
    """Update coupon"""
    coupon = await coupon_crud.update_coupon(coupon_id, coupon_data)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    return CouponResponse(
        success=True,
        message="Coupon updated successfully",
        data=coupon
    )

@router.delete("/{coupon_id}")
async def delete_coupon(coupon_id: int):
    """Delete coupon"""
    success = await coupon_crud.delete_coupon(coupon_id)
    if not success:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    return {"success": True, "message": "Coupon deleted successfully"}

@router.post("/apply/{coupon_code}")
async def apply_coupon(coupon_code: str, order_amount: float):
    """Apply coupon discount to order amount"""
    discounted_amount = await coupon_crud.apply_coupon(coupon_code, order_amount)
    return {
        "success": True,
        "message": "Coupon applied successfully",
        "data": {
            "original_amount": order_amount,
            "discounted_amount": discounted_amount
        }
    }

@router.get("/{coupon_id}/usage-stats", response_model=dict)
async def get_coupon_usage_stats(coupon_id: int):
    """Get coupon usage statistics"""
    stats = await coupon_crud.get_coupon_usage_stats(coupon_id)
    return {
        "success": True,
        "message": "Coupon usage statistics retrieved successfully",
        "data": stats
    }

@router.post("/{coupon_id}/activate", response_model=CouponResponse)
async def activate_coupon(coupon_id: int):
    """Activate a coupon"""
    coupon = await coupon_crud.activate_coupon(coupon_id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    return CouponResponse(
        success=True,
        message="Coupon activated successfully",
        data=coupon
    )

@router.post("/{coupon_id}/deactivate", response_model=CouponResponse)
async def deactivate_coupon(coupon_id: int):
    """Deactivate a coupon"""
    coupon = await coupon_crud.deactivate_coupon(coupon_id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    return CouponResponse(
        success=True,
        message="Coupon deactivated successfully",
        data=coupon
    )

@router.get("/{coupon_id}/redemptions", response_model=List[CouponRedeemOut])
async def get_coupon_redemptions(coupon_id: int):
    """Get redemptions for a coupon"""
    redemptions = await coupon_crud.get_coupon_redemptions(coupon_id)
    return redemptions

@router.get("/{coupon_id}/check-redeemed/{customer_id}")
async def check_coupon_already_redeemed(coupon_id: int, customer_id: int):
    """Check if customer has already redeemed this coupon"""
    already_redeemed = await coupon_crud.check_coupon_already_redeemed(coupon_id, customer_id)
    return {
        "success": True,
        "message": "Coupon redemption check completed",
        "data": {
            "already_redeemed": already_redeemed
        }
    } 