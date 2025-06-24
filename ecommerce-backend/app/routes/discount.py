from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.crud import discount_crud
from app.schemas.discount import (
    DiscountCreate, DiscountUpdate, DiscountOut, DiscountWithProduct, 
    DiscountList, ActiveDiscountList, DiscountResponse
)

router = APIRouter(prefix="/discounts", tags=["discounts"])

@router.post("/", response_model=DiscountResponse)
async def create_discount(discount_data: DiscountCreate):
    """Create a new discount"""
    try:
        discount = await discount_crud.create_discount(discount_data)
        return DiscountResponse(
            success=True,
            message="Discount created successfully",
            data=discount
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{discount_id}", response_model=DiscountResponse)
async def get_discount(discount_id: int):
    """Get discount by ID"""
    discount = await discount_crud.get_discount_by_id(discount_id)
    if not discount:
        raise HTTPException(status_code=404, detail="Discount not found")
    
    return DiscountResponse(
        success=True,
        message="Discount retrieved successfully",
        data=discount
    )

@router.get("/product/{product_id}", response_model=List[DiscountOut])
async def get_discounts_by_product(product_id: int):
    """Get discounts by product ID"""
    discounts = await discount_crud.get_discounts_by_product(product_id)
    return discounts

@router.get("/active/", response_model=ActiveDiscountList)
async def get_active_discounts():
    """Get all active discounts"""
    discounts = await discount_crud.get_active_discounts()
    return ActiveDiscountList(
        discounts=discounts,
        total=len(discounts)
    )

@router.get("/", response_model=DiscountList)
async def get_discounts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all discounts with pagination"""
    discounts = await discount_crud.get_discounts(skip=skip, limit=limit)
    total = len(discounts)
    
    return DiscountList(
        discounts=discounts,
        total=total,
        skip=skip,
        limit=limit
    )

@router.put("/{discount_id}", response_model=DiscountResponse)
async def update_discount(discount_id: int, discount_data: DiscountUpdate):
    """Update discount"""
    discount = await discount_crud.update_discount(discount_id, discount_data)
    if not discount:
        raise HTTPException(status_code=404, detail="Discount not found")
    
    return DiscountResponse(
        success=True,
        message="Discount updated successfully",
        data=discount
    )

@router.delete("/{discount_id}")
async def delete_discount(discount_id: int):
    """Delete discount"""
    success = await discount_crud.delete_discount(discount_id)
    if not success:
        raise HTTPException(status_code=404, detail="Discount not found")
    
    return {"success": True, "message": "Discount deleted successfully"}

@router.get("/{discount_id}/with-product", response_model=dict)
async def get_discount_with_product(discount_id: int):
    """Get discount with product details"""
    discount_data = await discount_crud.get_discount_with_product(discount_id)
    if not discount_data:
        raise HTTPException(status_code=404, detail="Discount not found")
    
    return {
        "success": True,
        "message": "Discount with product details retrieved successfully",
        "data": discount_data
    }

@router.get("/product/{product_id}/active", response_model=List[DiscountOut])
async def get_active_discounts_by_product(product_id: int):
    """Get active discounts for a product"""
    discounts = await discount_crud.get_active_discounts_by_product(product_id)
    return discounts

@router.post("/product/{product_id}/calculate")
async def calculate_discounted_price(product_id: int, original_price: float):
    """Calculate discounted price for a product"""
    discounted_price = await discount_crud.calculate_discounted_price(product_id, original_price)
    return {
        "success": True,
        "message": "Discounted price calculated successfully",
        "data": {
            "original_price": original_price,
            "discounted_price": discounted_price
        }
    }

@router.post("/{discount_id}/activate", response_model=DiscountResponse)
async def activate_discount(discount_id: int):
    """Activate a discount"""
    discount = await discount_crud.activate_discount(discount_id)
    if not discount:
        raise HTTPException(status_code=404, detail="Discount not found")
    
    return DiscountResponse(
        success=True,
        message="Discount activated successfully",
        data=discount
    )

@router.post("/{discount_id}/deactivate", response_model=DiscountResponse)
async def deactivate_discount(discount_id: int):
    """Deactivate a discount"""
    discount = await discount_crud.deactivate_discount(discount_id)
    if not discount:
        raise HTTPException(status_code=404, detail="Discount not found")
    
    return DiscountResponse(
        success=True,
        message="Discount deactivated successfully",
        data=discount
    )

@router.get("/expired/", response_model=List[DiscountOut])
async def get_expired_discounts():
    """Get expired discounts"""
    discounts = await discount_crud.get_expired_discounts()
    return discounts

@router.get("/upcoming/", response_model=List[DiscountOut])
async def get_upcoming_discounts():
    """Get upcoming discounts"""
    discounts = await discount_crud.get_upcoming_discounts()
    return discounts

@router.get("/type/{discount_type}", response_model=List[DiscountOut])
async def get_discounts_by_type(discount_type: str):
    """Get discounts by type"""
    discounts = await discount_crud.get_discounts_by_type(discount_type)
    return discounts 