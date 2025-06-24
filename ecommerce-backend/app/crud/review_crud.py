from typing import List, Optional
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewOut

async def create_review(review_data: ReviewCreate) -> Review:
    """Create a new review"""
    return await Review.create(
        customer_id=review_data.customer_id,
        product_id=review_data.product_id,
        rating=review_data.rating,
        comment=review_data.comment
    )

async def get_review_by_id(review_id: int) -> Optional[Review]:
    """Get review by ID"""
    return await Review.get_by_id(review_id)

async def get_reviews_by_product(product_id: int, skip: int = 0, limit: int = 100) -> List[Review]:
    """Get reviews by product ID"""
    return await Review.get_by_product_id(product_id, skip=skip, limit=limit)

async def get_reviews_by_customer(customer_id: int, skip: int = 0, limit: int = 100) -> List[Review]:
    """Get reviews by customer ID"""
    return await Review.get_by_customer_id(customer_id, skip=skip, limit=limit)

async def get_reviews(skip: int = 0, limit: int = 100) -> List[Review]:
    """Get all reviews with pagination"""
    return await Review.get_all(skip=skip, limit=limit)

async def update_review(review_id: int, review_data: ReviewUpdate) -> Optional[Review]:
    """Update review"""
    review = await Review.get_by_id(review_id)
    if not review:
        return None
    
    update_data = {}
    if review_data.rating is not None:
        update_data['rating'] = review_data.rating
    if review_data.comment is not None:
        update_data['comment'] = review_data.comment
    
    return await review.update(**update_data)

async def delete_review(review_id: int) -> bool:
    """Delete review"""
    review = await Review.get_by_id(review_id)
    if not review:
        return False
    return await review.delete()

async def get_review_with_customer(review_id: int) -> Optional[dict]:
    """Get review with customer details"""
    return await Review.get_with_customer(review_id)

async def get_review_with_product(review_id: int) -> Optional[dict]:
    """Get review with product details"""
    return await Review.get_with_product(review_id)

async def get_product_rating_stats(product_id: int) -> Optional[dict]:
    """Get product rating statistics"""
    return await Review.get_product_rating_stats(product_id)

async def get_average_rating(product_id: int) -> float:
    """Get average rating for a product"""
    return await Review.get_average_rating(product_id)

async def get_reviews_by_rating(product_id: int, rating: int, skip: int = 0, limit: int = 100) -> List[Review]:
    """Get reviews by specific rating"""
    return await Review.get_by_rating(product_id, rating, skip=skip, limit=limit)

async def check_customer_review_exists(customer_id: int, product_id: int) -> Optional[Review]:
    """Check if customer has already reviewed a product"""
    return await Review.get_by_customer_and_product(customer_id, product_id)

async def get_recent_reviews(limit: int = 10) -> List[Review]:
    """Get recent reviews"""
    return await Review.get_recent(limit=limit)

async def get_helpful_reviews(product_id: int, limit: int = 10) -> List[Review]:
    """Get most helpful reviews for a product"""
    return await Review.get_helpful(product_id, limit=limit) 