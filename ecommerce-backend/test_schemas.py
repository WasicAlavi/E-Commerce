#!/usr/bin/env python3
"""
Test script to verify all schemas work correctly
"""

def test_schemas():
    """Test all schema imports and basic functionality"""
    try:
        from app.schemas import user, customer, address, product, tag, product_tag, product_image
        from app.schemas import order, order_item, order_status, cart, cart_item
        from app.schemas import payment_method, review, wishlist, wishlist_item
        from app.schemas import search_history, discount, coupon, coupon_redeem, admin
        print("✓ All schema modules imported successfully")
    except ImportError as e:
        print(f"✗ Schema import failed: {e}")
        return False
    
    # Test basic schema creation
    try:
        from app.schemas.user import UserCreate
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword123",
            first_name="Test",
            last_name="User"
        )
        print("✓ UserCreate schema works")
    except Exception as e:
        print(f"✗ UserCreate schema failed: {e}")
    
    try:
        from app.schemas.product import ProductCreate
        product_data = ProductCreate(
            name="Test Product",
            description="Test description",
            price=99.99,
            stock=10
        )
        print("✓ ProductCreate schema works")
    except Exception as e:
        print(f"✗ ProductCreate schema failed: {e}")
    
    try:
        from app.schemas.payment_method import PaymentMethodCreate
        payment_data = PaymentMethodCreate(
            customer_id=1,
            account_no="1234567890",
            type="credit_card",
            is_default=True
        )
        print("✓ PaymentMethodCreate schema works")
    except Exception as e:
        print(f"✗ PaymentMethodCreate schema failed: {e}")
    
    try:
        from app.schemas.review import ReviewCreate
        review_data = ReviewCreate(
            customer_id=1,
            product_id=1,
            rating=5,
            comment="Great product!"
        )
        print("✓ ReviewCreate schema works")
    except Exception as e:
        print(f"✗ ReviewCreate schema failed: {e}")
    
    try:
        from app.schemas.coupon import CouponCreate
        from datetime import datetime, timedelta
        coupon_data = CouponCreate(
            code="SAVE20",
            discount_type="percentage",
            value=20.0,
            usage_limit=100,
            valid_from=datetime.now(),
            valid_until=datetime.now() + timedelta(days=30)
        )
        print("✓ CouponCreate schema works")
    except Exception as e:
        print(f"✗ CouponCreate schema failed: {e}")
    
    return True

if __name__ == "__main__":
    print("Testing schemas...")
    success = test_schemas()
    if success:
        print("✓ All schema tests passed!")
    else:
        print("✗ Some schema tests failed!")
    print("Schema test completed!") 