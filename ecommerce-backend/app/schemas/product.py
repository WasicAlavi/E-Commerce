from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
from .product_image import ProductImageOut

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Product name")
    description: str = Field(..., min_length=1, max_length=2000, description="Product description")
    price: float = Field(..., gt=0, description="Product price")
    stock: int = Field(..., ge=0, description="Stock")
    brand: Optional[str] = Field(None, max_length=100, description="Product brand")
    material: Optional[str] = Field(None, description="Product material")
    colors: Optional[List[str]] = Field(default=[], description="Available colors")
    sizes: Optional[List[str]] = Field(default=[], description="Available sizes")
    care_instructions: Optional[str] = Field(None, description="Care instructions")
    features: Optional[List[str]] = Field(default=[], description="Product features")
    specifications: Optional[Dict[str, Any]] = Field(default={}, description="Product specifications")

    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Product name cannot be empty')
        return v.strip()

    @validator('description')
    def validate_description(cls, v):
        if not v.strip():
            raise ValueError('Product description cannot be empty')
        return v.strip()

    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than 0')
        return round(v, 2)

    @validator('stock')
    def validate_stock(cls, v):
        if v < 0:
            raise ValueError('Stock cannot be negative')
        return v

class ProductCreate(ProductBase):
    category: Optional[str] = Field(None, description="Product category/tag")

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200, description="Product name")
    description: Optional[str] = Field(None, min_length=1, max_length=2000, description="Product description")
    price: Optional[float] = Field(None, gt=0, description="Product price")
    stock: Optional[int] = Field(None, ge=0, description="Stock")
    brand: Optional[str] = Field(None, max_length=100, description="Product brand")
    material: Optional[str] = Field(None, description="Product material")
    colors: Optional[List[str]] = Field(None, description="Available colors")
    sizes: Optional[List[str]] = Field(None, description="Available sizes")
    care_instructions: Optional[str] = Field(None, description="Care instructions")
    features: Optional[List[str]] = Field(None, description="Product features")
    specifications: Optional[Dict[str, Any]] = Field(None, description="Product specifications")

    @validator('name')
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Product name cannot be empty')
        return v.strip() if v else v

    @validator('description')
    def validate_description(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Product description cannot be empty')
        return v.strip() if v else v

    @validator('price')
    def validate_price(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Price must be greater than 0')
        return round(v, 2) if v else v

    @validator('stock')
    def validate_stock(cls, v):
        if v is not None and v < 0:
            raise ValueError('Stock cannot be negative')
        return v



class ProductTagOut(BaseModel):
    id: int = Field(..., description="Tag ID")
    name: str = Field(..., description="Tag name")

    class Config:
        from_attributes = True

class ProductOut(ProductBase):
    id: int = Field(..., description="Product ID")
    image_url: Optional[str] = Field(None, description="Primary image URL")
    images: Optional[List[ProductImageOut]] = Field(default=[], description="List of product images")
    tags: Optional[List[ProductTagOut]] = Field(default=[], description="List of product tags")
    rating: Optional[float] = Field(None, ge=0.0, le=5.0, description="Average product rating")
    reviews: int = Field(default=0, description="Number of reviews")
    discount: float = Field(default=0.0, ge=0.0, le=1.0, description="Discount percentage (0.0 to 1.0)")
    created_at: Optional[datetime] = Field(None, description="Product creation date")
    updated_at: Optional[datetime] = Field(None, description="Product last update date")

    class Config:
        from_attributes = True

class ProductWithDetails(ProductOut):
    average_rating: Optional[float] = Field(None, description="Average product rating")
    total_reviews: int = Field(..., description="Total number of reviews")
    discount_amount: Optional[float] = Field(None, description="Current discount amount")
    final_price: Optional[float] = Field(None, description="Final price after discount")

# New schema for compare products functionality
class ProductForCompare(BaseModel):
    """Schema specifically for CompareProducts component"""
    id: int = Field(..., description="Product ID")
    name: str = Field(..., description="Product name")
    price: float = Field(..., description="Product price")
    original_price: float = Field(..., description="Original price before discount")
    image: Optional[str] = Field(None, description="Product image URL")
    discount: float = Field(default=0.0, ge=0.0, le=1.0, description="Discount percentage")
    rating: Optional[float] = Field(None, ge=0.0, le=5.0, description="Average product rating")
    reviews: int = Field(default=0, description="Number of reviews")
    brand: Optional[str] = Field(None, description="Product brand")
    material: Optional[str] = Field(None, description="Product material")
    color: Optional[str] = Field(None, description="Available colors")
    size: Optional[str] = Field(None, description="Available sizes")
    care: Optional[str] = Field(None, description="Care instructions")
    features: List[str] = Field(default=[], description="Product features")
    inStock: bool = Field(default=True, description="Stock availability")

    class Config:
        from_attributes = True

# New schemas for ProductCard compatibility
class ProductCard(BaseModel):
    """Schema specifically for ProductCard component"""
    id: int = Field(..., description="Product ID")
    name: str = Field(..., description="Product name")
    description: str = Field(..., description="Product description")
    price: float = Field(..., description="Product price")
    stock: int = Field(..., description="Stock")
    image: Optional[str] = Field(None, description="Product image URL")
    discount: float = Field(default=0.0, ge=0.0, le=1.0, description="Discount percentage (0.0 to 1.0)")
    rating: Optional[float] = Field(None, ge=0.0, le=5.0, description="Average product rating")
    total_reviews: int = Field(default=0, description="Total number of reviews")
    category: Optional[str] = Field(None, description="Product category (main tag)")

    @property
    def discounted_price(self) -> float:
        """Calculate discounted price"""
        return round(self.price * (1 - self.discount), 2)

    @property
    def has_discount(self) -> bool:
        """Check if product has discount"""
        return self.discount > 0

    @property
    def discount_percentage(self) -> int:
        """Get discount as percentage for display"""
        return int(self.discount * 100)

    class Config:
        from_attributes = True

class ProductCardList(BaseModel):
    """List of products for ProductCard components"""
    products: List[ProductCard] = Field(..., description="List of products")
    total: int = Field(..., description="Total number of products")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Products per page")

class ProductList(BaseModel):
    products: List[ProductOut] = Field(..., description="List of products")
    total: int = Field(..., description="Total number of products")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Products per page")

class ProductSearch(BaseModel):
    query: Optional[str] = Field(None, description="Search query")
    min_price: Optional[float] = Field(None, ge=0, description="Minimum price filter")
    max_price: Optional[float] = Field(None, ge=0, description="Maximum price filter")
    tags: Optional[List[str]] = Field(None, description="Filter by tags")
    in_stock: Optional[bool] = Field(None, description="Filter by stock availability")
    sort_by: Optional[str] = Field(None, description="Sort field (name, price, rating, created_at)")
    sort_order: Optional[str] = Field(None, description="Sort order (asc, desc)")

class ProductResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[ProductOut] = Field(None, description="Product data")
