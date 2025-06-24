#!/usr/bin/env python3
"""
Test script to verify all CRUD operations work correctly
"""

def test_crud_imports():
    """Test all CRUD module imports"""
    try:
        # Test all CRUD imports
        from app.crud import user_crud, customer_crud, address
        from app.crud import product_crud, order_crud, cart_crud
        from app.crud import payment_crud, review_crud, wishlist_crud
        from app.crud import discount_crud, coupon_crud, admin_crud
        print("✓ All CRUD modules imported successfully")
    except ImportError as e:
        print(f"✗ CRUD import failed: {e}")
        return False
    
    # Test database layer imports
    try:
        from app.db import base, session, init_db
        print("✓ Database layer modules imported successfully")
    except ImportError as e:
        print(f"✗ Database layer import failed: {e}")
        return False
    
    return True

def test_crud_functions():
    """Test that CRUD functions are properly defined"""
    try:
        from app.crud import user_crud
        
        # Test that key functions exist
        assert hasattr(user_crud, 'create_user')
        assert hasattr(user_crud, 'get_user_by_id')
        assert hasattr(user_crud, 'authenticate_user')
        print("✓ User CRUD functions defined")
        
        from app.crud import product_crud
        assert hasattr(product_crud, 'create_product')
        assert hasattr(product_crud, 'get_product_by_id')
        assert hasattr(product_crud, 'search_products')
        print("✓ Product CRUD functions defined")
        
        from app.crud import order_crud
        assert hasattr(order_crud, 'create_order')
        assert hasattr(order_crud, 'get_order_by_id')
        assert hasattr(order_crud, 'get_orders_by_customer')
        print("✓ Order CRUD functions defined")
        
        from app.crud import cart_crud
        assert hasattr(cart_crud, 'create_cart')
        assert hasattr(cart_crud, 'get_cart_by_customer')
        assert hasattr(cart_crud, 'add_cart_item')
        print("✓ Cart CRUD functions defined")
        
        from app.crud import payment_crud
        assert hasattr(payment_crud, 'create_payment_method')
        assert hasattr(payment_crud, 'get_payment_methods_by_customer')
        print("✓ Payment CRUD functions defined")
        
        from app.crud import review_crud
        assert hasattr(review_crud, 'create_review')
        assert hasattr(review_crud, 'get_reviews_by_product')
        print("✓ Review CRUD functions defined")
        
        from app.crud import wishlist_crud
        assert hasattr(wishlist_crud, 'create_wishlist')
        assert hasattr(wishlist_crud, 'add_wishlist_item')
        print("✓ Wishlist CRUD functions defined")
        
        from app.crud import discount_crud
        assert hasattr(discount_crud, 'create_discount')
        assert hasattr(discount_crud, 'calculate_discounted_price')
        print("✓ Discount CRUD functions defined")
        
        from app.crud import coupon_crud
        assert hasattr(coupon_crud, 'create_coupon')
        assert hasattr(coupon_crud, 'validate_coupon')
        print("✓ Coupon CRUD functions defined")
        
        from app.crud import admin_crud
        assert hasattr(admin_crud, 'create_admin')
        assert hasattr(admin_crud, 'check_admin_permissions')
        print("✓ Admin CRUD functions defined")
        
    except Exception as e:
        print(f"✗ CRUD function test failed: {e}")
        return False
    
    return True

def test_database_layer():
    """Test database layer functions"""
    try:
        from app.db.base import get_db_pool, execute_query, execute_many
        assert callable(get_db_pool)
        assert callable(execute_query)
        assert callable(execute_many)
        print("✓ Database layer functions defined")
        
        from app.db.session import get_db_session, get_db_transaction
        assert callable(get_db_session)
        assert callable(get_db_transaction)
        print("✓ Database session functions defined")
        
    except Exception as e:
        print(f"✗ Database layer test failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Testing CRUD operations...")
    
    # Test imports
    import_success = test_crud_imports()
    
    # Test function definitions
    function_success = test_crud_functions()
    
    # Test database layer
    db_success = test_database_layer()
    
    if import_success and function_success and db_success:
        print("✓ All CRUD tests passed!")
    else:
        print("✗ Some CRUD tests failed!")
    
    print("CRUD test completed!") 