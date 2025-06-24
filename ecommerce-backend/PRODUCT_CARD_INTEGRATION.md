# ProductCard Integration

This document explains the changes made to the backend to support the ProductCard component from the frontend.

## Overview

The ProductCard component expects the following fields:
- `id` - Product ID
- `name` - Product name
- `description` - Product description
- `price` - Original price
- `stock` - Stock quantity
- `image` - Product image URL
- `discount` - Discount percentage (0.0 to 1.0)
- `rating` - Average product rating
- `total_reviews` - Total number of reviews

## Changes Made

### 1. Updated Product Schema (`app/schemas/product.py`)

#### Fixed Stock Field References
- Changed all references from "stock quantity" to "stock"
- Updated field descriptions and validator names
- Fixed error messages

#### Added New ProductCard Schema
```python
class ProductCard(BaseModel):
    id: int
    name: str
    description: str
    price: float
    stock: int
    image: Optional[str]
    discount: float = Field(default=0.0, ge=0.0, le=1.0)
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)
    total_reviews: int = Field(default=0)
    
    @property
    def discounted_price(self) -> float:
        return round(self.price * (1 - self.discount), 2)
    
    @property
    def has_discount(self) -> bool:
        return self.discount > 0
```

#### Added ProductCardList Schema
```python
class ProductCardList(BaseModel):
    products: List[ProductCard]
    total: int
    page: int
    per_page: int
```

### 2. Updated Product Model (`app/models/product.py`)

#### Added New Methods for ProductCard Data
- `get_products_for_card()` - Get products with all ProductCard fields
- `get_product_for_card()` - Get single product with ProductCard fields
- `search_products_for_card()` - Search products with ProductCard fields

These methods join the following tables:
- `products` - Basic product information
- `product_images` - Product images (primary image)
- `discounts` - Active discounts (percentage type only)
- `reviews` - Product ratings and review counts

#### SQL Query Structure
```sql
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.stock,
    pi.image_url as image,
    COALESCE(d.value / 100.0, 0.0) as discount,
    COALESCE(AVG(r.rating), 0.0) as rating,
    COUNT(r.id) as total_reviews
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
LEFT JOIN discounts d ON p.id = d.product_id 
    AND d.start_date <= CURRENT_DATE 
    AND d.end_date >= CURRENT_DATE
    AND d.discount_type = 'percentage'
LEFT JOIN reviews r ON p.id = r.product_id
GROUP BY p.id, p.name, p.description, p.price, p.stock, pi.image_url, d.value
```

### 3. Updated Wishlist Item Schema (`app/schemas/wishlist_item.py`)
- Changed description from "Product stock quantity" to "Product stock"

### 4. Updated Wishlist Item Model (`app/models/wishlist_item.py`)
- Fixed SQL query to use `p.stock` instead of `p.stock_quantity`

### 5. Updated Test Files
- Fixed `test_schemas.py` to use `stock` instead of `stock_quantity`
- Created `test_product_card.py` to test new ProductCard schemas

## Database Requirements

The following tables must exist for the ProductCard integration to work:

1. **products** - Core product information
2. **product_images** - Product images with primary flag
3. **discounts** - Product discounts with date ranges and types
4. **reviews** - Product reviews and ratings

## Usage Examples

### Creating a ProductCard Object
```python
from app.schemas.product import ProductCard

product_card = ProductCard(
    id=1,
    name="Sample Product",
    description="Product description",
    price=100.00,
    stock=10,
    image="https://example.com/image.jpg",
    discount=0.2,  # 20% discount
    rating=4.5,
    total_reviews=25
)

# Access calculated properties
print(f"Discounted price: ৳{product_card.discounted_price}")
print(f"Has discount: {product_card.has_discount}")
```

### Using the Model Methods
```python
from app.models.product import Product

# Get products for ProductCard components
products = await Product.get_products_for_card(limit=20, offset=0)

# Get single product for ProductCard
product = await Product.get_product_for_card(product_id=1)

# Search products for ProductCard
search_results = await Product.search_products_for_card("search term")
```

## Frontend Integration

The ProductCard component can now receive data in the expected format:

```javascript
const product = {
    id: 1,
    name: "Product Name",
    description: "Product description",
    price: 100.00,
    stock: 10,
    image: "https://example.com/image.jpg",
    discount: 0.2,  // 20% discount
    rating: 4.5,
    total_reviews: 25
};

// The component will automatically calculate:
// - Discounted price: product.price * (1 - product.discount)
// - Show discount badge if product.discount > 0
// - Display rating and review count
```

## Testing

Run the test script to verify the integration:
```bash
python test_product_card.py
```

This will test:
- ProductCard schema creation
- Property calculations (discounted_price, has_discount)
- ProductCardList schema
- Default values for optional fields 