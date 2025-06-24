from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.crud import review_crud
from app.schemas.review import (
    ReviewCreate, ReviewUpdate, ReviewOut, ReviewWithCustomer, 
    ReviewWithProduct, ReviewList, ReviewResponse, ProductRatingStats
)

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("/", response_model=ReviewResponse)
async def create_review(review_data: ReviewCreate):
    """Create a new review"""
    try:
        review = await review_crud.create_review(review_data)
        return ReviewResponse(
            success=True,
            message="Review created successfully",
            data=review
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(review_id: int):
    """Get review by ID"""
    review = await review_crud.get_review_by_id(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return ReviewResponse(
        success=True,
        message="Review retrieved successfully",
        data=review
    )

@router.get("/product/{product_id}", response_model=ReviewList)
async def get_reviews_by_product(
    product_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get reviews by product ID"""
    reviews = await review_crud.get_reviews_by_product(product_id, skip=skip, limit=limit)
    total = len(reviews)
    
    return ReviewList(
        reviews=reviews,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/customer/{customer_id}", response_model=ReviewList)
async def get_reviews_by_customer(
    customer_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get reviews by customer ID"""
    reviews = await review_crud.get_reviews_by_customer(customer_id, skip=skip, limit=limit)
    total = len(reviews)
    
    return ReviewList(
        reviews=reviews,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/", response_model=ReviewList)
async def get_reviews(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all reviews with pagination"""
    reviews = await review_crud.get_reviews(skip=skip, limit=limit)
    total = len(reviews)
    
    return ReviewList(
        reviews=reviews,
        total=total,
        skip=skip,
        limit=limit
    )

@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(review_id: int, review_data: ReviewUpdate):
    """Update review"""
    review = await review_crud.update_review(review_id, review_data)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return ReviewResponse(
        success=True,
        message="Review updated successfully",
        data=review
    )

@router.delete("/{review_id}")
async def delete_review(review_id: int):
    """Delete review"""
    success = await review_crud.delete_review(review_id)
    if not success:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return {"success": True, "message": "Review deleted successfully"}

@router.get("/{review_id}/with-customer", response_model=dict)
async def get_review_with_customer(review_id: int):
    """Get review with customer details"""
    review_data = await review_crud.get_review_with_customer(review_id)
    if not review_data:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return {
        "success": True,
        "message": "Review with customer details retrieved successfully",
        "data": review_data
    }

@router.get("/{review_id}/with-product", response_model=dict)
async def get_review_with_product(review_id: int):
    """Get review with product details"""
    review_data = await review_crud.get_review_with_product(review_id)
    if not review_data:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return {
        "success": True,
        "message": "Review with product details retrieved successfully",
        "data": review_data
    }

@router.get("/product/{product_id}/rating-stats", response_model=dict)
async def get_product_rating_stats(product_id: int):
    """Get product rating statistics"""
    stats = await review_crud.get_product_rating_stats(product_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "success": True,
        "message": "Product rating statistics retrieved successfully",
        "data": stats
    }

@router.get("/product/{product_id}/average-rating")
async def get_average_rating(product_id: int):
    """Get average rating for a product"""
    avg_rating = await review_crud.get_average_rating(product_id)
    return {
        "success": True,
        "message": "Average rating retrieved successfully",
        "data": {"average_rating": avg_rating}
    }

@router.get("/product/{product_id}/rating/{rating}", response_model=ReviewList)
async def get_reviews_by_rating(
    product_id: int,
    rating: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get reviews by specific rating"""
    reviews = await review_crud.get_reviews_by_rating(product_id, rating, skip=skip, limit=limit)
    total = len(reviews)
    
    return ReviewList(
        reviews=reviews,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/check/{customer_id}/{product_id}")
async def check_customer_review_exists(customer_id: int, product_id: int):
    """Check if customer has already reviewed a product"""
    review = await review_crud.check_customer_review_exists(customer_id, product_id)
    return {
        "success": True,
        "message": "Review existence check completed",
        "data": {"exists": review is not None, "review": review}
    }

@router.get("/recent/", response_model=ReviewList)
async def get_recent_reviews(limit: int = Query(10, ge=1, le=100)):
    """Get recent reviews"""
    reviews = await review_crud.get_recent_reviews(limit=limit)
    return ReviewList(
        reviews=reviews,
        total=len(reviews),
        skip=0,
        limit=limit
    )

@router.get("/product/{product_id}/helpful", response_model=ReviewList)
async def get_helpful_reviews(product_id: int, limit: int = Query(10, ge=1, le=100)):
    """Get most helpful reviews for a product"""
    reviews = await review_crud.get_helpful_reviews(product_id, limit=limit)
    return ReviewList(
        reviews=reviews,
        total=len(reviews),
        skip=0,
        limit=limit
    ) 