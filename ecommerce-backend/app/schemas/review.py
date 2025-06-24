from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List, Dict

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    comment: Optional[str] = Field(None, max_length=1000, description="Review comment")

    @validator('rating')
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class ReviewCreate(ReviewBase):
    customer_id: int = Field(..., description="ID of the customer")
    product_id: int = Field(..., description="ID of the product")

class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5, description="Rating from 1 to 5 stars")
    comment: Optional[str] = Field(None, max_length=1000, description="Review comment")

    @validator('rating')
    def validate_rating(cls, v):
        if v is not None and (v < 1 or v > 5):
            raise ValueError('Rating must be between 1 and 5')
        return v

class ReviewOut(ReviewBase):
    id: int = Field(..., description="Review ID")
    customer_id: int = Field(..., description="ID of the customer")
    product_id: int = Field(..., description="ID of the product")
    review_date: datetime = Field(..., description="Date when review was created")

    class Config:
        from_attributes = True

class ReviewWithCustomer(ReviewOut):
    customer_name: str = Field(..., description="Customer name")
    customer_email: str = Field(..., description="Customer email")

class ReviewWithProduct(ReviewOut):
    product_name: str = Field(..., description="Product name")
    product_price: float = Field(..., description="Product price")

class ReviewList(BaseModel):
    reviews: List[ReviewOut] = Field(..., description="List of reviews")
    total: int = Field(..., description="Total number of reviews")
    average_rating: float = Field(..., description="Average rating")

class ProductRatingStats(BaseModel):
    product_id: int = Field(..., description="Product ID")
    average_rating: float = Field(..., description="Average rating")
    total_reviews: int = Field(..., description="Total number of reviews")
    rating_distribution: Dict[int, int] = Field(..., description="Distribution of ratings")

class ReviewResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[ReviewOut] = Field(None, description="Review data")
