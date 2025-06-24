#!/usr/bin/env python3
"""
Test script to verify ProductCard schema works correctly
"""

def test_product_card_schema():
    """Test ProductCard schema with sample data"""
    try:
        from app.schemas.product import ProductCard
        print("✓ ProductCard schema imported successfully")
    except ImportError as e:
        print(f"✗ ProductCard schema import failed: {e}")
        return False
    
    # Test basic ProductCard creation
    try:
        product_data = {
            "id": 1,
            "name": "Test Product",
            "description": "Test description",
            "price": 99.99,
            "stock": 10,
            "image": "https://example.com/image.jpg",
            "discount": 0.2,  # 20% discount
            "rating": 4.5,
            "total_reviews": 25
        }
        
        product_card = ProductCard(**product_data)
        print("✓ ProductCard creation works")
        
        # Test properties
        print(f"  - Discounted price: ৳{product_card.discounted_price}")
        print(f"  - Has discount: {product_card.has_discount}")
        print(f"  - Original price: ৳{product_card.price}")
        print(f"  - Discount percentage: {product_card.discount * 100}%")
        
    except Exception as e:
        print(f"✗ ProductCard creation failed: {e}")
        return False
    
    # Test ProductCard with no discount
    try:
        product_data_no_discount = {
            "id": 2,
            "name": "No Discount Product",
            "description": "No discount description",
            "price": 50.00,
            "stock": 5,
            "image": "https://example.com/image2.jpg",
            "discount": 0.0,  # No discount
            "rating": 3.8,
            "total_reviews": 10
        }
        
        product_card_no_discount = ProductCard(**product_data_no_discount)
        print("✓ ProductCard with no discount works")
        print(f"  - Discounted price: ৳{product_card_no_discount.discounted_price}")
        print(f"  - Has discount: {product_card_no_discount.has_discount}")
        
    except Exception as e:
        print(f"✗ ProductCard with no discount failed: {e}")
        return False
    
    # Test ProductCard with missing optional fields
    try:
        product_data_minimal = {
            "id": 3,
            "name": "Minimal Product",
            "description": "Minimal description",
            "price": 25.00,
            "stock": 15
            # Missing optional fields should use defaults
        }
        
        product_card_minimal = ProductCard(**product_data_minimal)
        print("✓ ProductCard with minimal data works")
        print(f"  - Default discount: {product_card_minimal.discount}")
        print(f"  - Default rating: {product_card_minimal.rating}")
        print(f"  - Default total_reviews: {product_card_minimal.total_reviews}")
        
    except Exception as e:
        print(f"✗ ProductCard with minimal data failed: {e}")
        return False
    
    return True

def test_product_card_list_schema():
    """Test ProductCardList schema"""
    try:
        from app.schemas.product import ProductCardList, ProductCard
        print("✓ ProductCardList schema imported successfully")
    except ImportError as e:
        print(f"✗ ProductCardList schema import failed: {e}")
        return False
    
    try:
        # Create sample products
        products = [
            ProductCard(
                id=1,
                name="Product 1",
                description="Description 1",
                price=100.00,
                stock=10,
                discount=0.1,
                rating=4.0,
                total_reviews=20
            ),
            ProductCard(
                id=2,
                name="Product 2",
                description="Description 2",
                price=200.00,
                stock=5,
                discount=0.0,
                rating=4.5,
                total_reviews=15
            )
        ]
        
        product_list = ProductCardList(
            products=products,
            total=2,
            page=1,
            per_page=20
        )
        
        print("✓ ProductCardList creation works")
        print(f"  - Total products: {product_list.total}")
        print(f"  - Page: {product_list.page}")
        print(f"  - Products per page: {product_list.per_page}")
        
    except Exception as e:
        print(f"✗ ProductCardList creation failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Testing ProductCard schemas...")
    print("=" * 50)
    
    success1 = test_product_card_schema()
    print()
    success2 = test_product_card_list_schema()
    
    print("=" * 50)
    if success1 and success2:
        print("✓ All ProductCard schema tests passed!")
    else:
        print("✗ Some ProductCard schema tests failed!")
    print("ProductCard schema test completed!") 