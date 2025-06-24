from typing import List, Optional
from app.models.discount import Discount
from app.schemas.discount import DiscountCreate, DiscountUpdate, DiscountOut

async def create_discount(discount_data: DiscountCreate) -> Discount:
    """Create a new discount"""
    return await Discount.create(
        product_id=discount_data.product_id,
        discount_type=discount_data.discount_type,
        value=discount_data.value,
        start_date=discount_data.start_date,
        end_date=discount_data.end_date,
        is_active=discount_data.is_active
    )

async def get_discount_by_id(discount_id: int) -> Optional[Discount]:
    """Get discount by ID"""
    return await Discount.get_by_id(discount_id)

async def get_discounts_by_product(product_id: int) -> List[Discount]:
    """Get discounts by product ID"""
    return await Discount.get_by_product_id(product_id)

async def get_active_discounts() -> List[Discount]:
    """Get all active discounts"""
    return await Discount.get_active()

async def get_discounts(skip: int = 0, limit: int = 100) -> List[Discount]:
    """Get all discounts with pagination"""
    return await Discount.get_all(skip=skip, limit=limit)

async def update_discount(discount_id: int, discount_data: DiscountUpdate) -> Optional[Discount]:
    """Update discount"""
    discount = await Discount.get_by_id(discount_id)
    if not discount:
        return None
    
    update_data = {}
    if discount_data.discount_type is not None:
        update_data['discount_type'] = discount_data.discount_type
    if discount_data.value is not None:
        update_data['value'] = discount_data.value
    if discount_data.start_date is not None:
        update_data['start_date'] = discount_data.start_date
    if discount_data.end_date is not None:
        update_data['end_date'] = discount_data.end_date
    if discount_data.is_active is not None:
        update_data['is_active'] = discount_data.is_active
    
    return await discount.update(**update_data)

async def delete_discount(discount_id: int) -> bool:
    """Delete discount"""
    discount = await Discount.get_by_id(discount_id)
    if not discount:
        return False
    return await discount.delete()

async def get_discount_with_product(discount_id: int) -> Optional[dict]:
    """Get discount with product details"""
    return await Discount.get_with_product(discount_id)

async def get_active_discounts_by_product(product_id: int) -> List[Discount]:
    """Get active discounts for a product"""
    return await Discount.get_active_by_product(product_id)

async def calculate_discounted_price(product_id: int, original_price: float) -> float:
    """Calculate discounted price for a product"""
    return await Discount.calculate_discounted_price(product_id, original_price)

async def activate_discount(discount_id: int) -> Optional[Discount]:
    """Activate a discount"""
    discount = await Discount.get_by_id(discount_id)
    if not discount:
        return None
    return await discount.activate()

async def deactivate_discount(discount_id: int) -> Optional[Discount]:
    """Deactivate a discount"""
    discount = await Discount.get_by_id(discount_id)
    if not discount:
        return None
    return await discount.deactivate()

async def get_expired_discounts() -> List[Discount]:
    """Get expired discounts"""
    return await Discount.get_expired()

async def get_upcoming_discounts() -> List[Discount]:
    """Get upcoming discounts"""
    return await Discount.get_upcoming()

async def get_discounts_by_type(discount_type: str) -> List[Discount]:
    """Get discounts by type"""
    return await Discount.get_by_type(discount_type) 