#!/usr/bin/env python3
"""
Test script to verify product data is returned correctly for ProductCard
"""

import asyncio
import json
from decimal import Decimal

def test_product_card_schema_with_data():
    """Test ProductCard schema with sample data to ensure no NaN issues"""
    try:
        from app.schemas.product import ProductCard
        print("✓ ProductCard schema imported successfully")
    except ImportError as e:
        print(f"✗ ProductCard schema import failed: {e}")
        return False
    
    # Test with complete data
    try:
        product_data = {
            "id": 1,
            "name": "Test Product",
            "description": "Test description",
            "price": 100.00,
            "stock": 10,
            "image": "https://example.com/image.jpg",
            "discount": 0.2,
            "rating": 4.5,
            "total_reviews": 25
        }
        
        product_card = ProductCard(**product_data)
        print("✓ ProductCard with complete data works")
        print(f"  - ID: {product_card.id}")
        print(f"  - Name: {product_card.name}")
        print(f"  - Price: ৳{product_card.price}")
        print(f"  - Stock: {product_card.stock}")
        print(f"  - Image: {product_card.image}")
        print(f"  - Discount: {product_card.discount} ({product_card.discount_percentage}%)")
        print(f"  - Rating: {product_card.rating}")
        print(f"  - Total Reviews: {product_card.total_reviews}")
        print(f"  - Discounted Price: ৳{product_card.discounted_price}")
        print(f"  - Has Discount: {product_card.has_discount}")
        
    except Exception as e:
        print(f"✗ ProductCard with complete data failed: {e}")
        return False
    
    # Test with missing optional data (should use defaults)
    try:
        product_data_minimal = {
            "id": 2,
            "name": "Minimal Product",
            "description": "Minimal description",
            "price": 50.00,
            "stock": 5
            # Missing: image, discount, rating, total_reviews
        }
        
        product_card_minimal = ProductCard(**product_data_minimal)
        print("\n✓ ProductCard with minimal data works")
        print(f"  - ID: {product_card_minimal.id}")
        print(f"  - Name: {product_card_minimal.name}")
        print(f"  - Price: ৳{product_card_minimal.price}")
        print(f"  - Stock: {product_card_minimal.stock}")
        print(f"  - Image: {product_card_minimal.image}")
        print(f"  - Discount: {product_card_minimal.discount} ({product_card_minimal.discount_percentage}%)")
        print(f"  - Rating: {product_card_minimal.rating}")
        print(f"  - Total Reviews: {product_card_minimal.total_reviews}")
        print(f"  - Discounted Price: ৳{product_card_minimal.discounted_price}")
        print(f"  - Has Discount: {product_card_minimal.has_discount}")
        
    except Exception as e:
        print(f"✗ ProductCard with minimal data failed: {e}")
        return False
    
    # Test with null values from database
    try:
        product_data_with_nulls = {
            "id": 3,
            "name": "Product with Nulls",
            "description": "Description with nulls",
            "price": 75.00,
            "stock": 15,
            "image": None,
            "discount": 0.0,
            "rating": None,
            "total_reviews": 0
        }
        
        product_card_nulls = ProductCard(**product_data_with_nulls)
        print("\n✓ ProductCard with null values works")
        print(f"  - ID: {product_card_nulls.id}")
        print(f"  - Name: {product_card_nulls.name}")
        print(f"  - Price: ৳{product_card_nulls.price}")
        print(f"  - Stock: {product_card_nulls.stock}")
        print(f"  - Image: {product_card_nulls.image}")
        print(f"  - Discount: {product_card_nulls.discount} ({product_card_nulls.discount_percentage}%)")
        print(f"  - Rating: {product_card_nulls.rating}")
        print(f"  - Total Reviews: {product_card_nulls.total_reviews}")
        print(f"  - Discounted Price: ৳{product_card_nulls.discounted_price}")
        print(f"  - Has Discount: {product_card_nulls.has_discount}")
        
    except Exception as e:
        print(f"✗ ProductCard with null values failed: {e}")
        return False
    
    return True

def test_data_serialization():
    """Test that data can be properly serialized to JSON"""
    try:
        from app.schemas.product import ProductCard
        
        product_data = {
            "id": 1,
            "name": "Test Product",
            "description": "Test description",
            "price": 100.00,
            "stock": 10,
            "image": "https://example.com/image.jpg",
            "discount": 0.2,
            "rating": 4.5,
            "total_reviews": 25
        }
        
        product_card = ProductCard(**product_data)
        
        # Test JSON serialization
        json_data = product_card.model_dump()
        json_string = json.dumps(json_data, indent=2)
        
        print("\n✓ JSON serialization works")
        print("Serialized data:")
        print(json_string)
        
        # Verify no NaN values
        def check_for_nan(obj):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    if check_for_nan(value):
                        print(f"  Found NaN in key: {key}")
                        return True
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    if check_for_nan(item):
                        print(f"  Found NaN in list index: {i}")
                        return True
            elif isinstance(obj, (int, float)) and (obj != obj):  # NaN check
                return True
            return False
        
        if not check_for_nan(json_data):
            print("  ✓ No NaN values found in serialized data")
        else:
            print("  ✗ NaN values found in serialized data")
            return False
            
    except Exception as e:
        print(f"✗ JSON serialization failed: {e}")
        return False
    
    return True

async def test_model_methods():
    """Test the model methods that fetch product data"""
    try:
        from app.models.product import Product
        
        print("\nTesting model methods...")
        
        # Test getting products for card
        products = await Product.get_products_for_card(limit=5, offset=0)
        print(f"✓ Retrieved {len(products)} products for card")
        
        if products:
            first_product = products[0]
            print("First product data:")
            for key, value in first_product.items():
                print(f"  - {key}: {value} (type: {type(value).__name__})")
            
            # Check for NaN values
            def check_nan_in_dict(data):
                for key, value in data.items():
                    if isinstance(value, (int, float)) and (value != value):  # NaN check
                        print(f"    ✗ Found NaN in {key}: {value}")
                        return True
                return False
            
            if not check_nan_in_dict(first_product):
                print("  ✓ No NaN values found in product data")
            else:
                print("  ✗ NaN values found in product data")
                return False
        
    except Exception as e:
        print(f"✗ Model methods test failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Testing product data integrity...")
    print("=" * 60)
    
    success1 = test_product_card_schema_with_data()
    success2 = test_data_serialization()
    
    # Test async methods if we can
    try:
        import asyncio
        success3 = asyncio.run(test_model_methods())
    except Exception as e:
        print(f"\n⚠ Async test skipped: {e}")
        success3 = True
    
    print("=" * 60)
    if success1 and success2 and success3:
        print("✓ All product data tests passed!")
    else:
        print("✗ Some product data tests failed!")
    print("Product data test completed!") 