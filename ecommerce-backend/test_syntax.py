#!/usr/bin/env python3
"""
Simple syntax test for schema changes
"""

def test_syntax():
    """Test that the schema files have correct syntax"""
    try:
        # Test product schema syntax
        with open('app/schemas/product.py', 'r') as f:
            content = f.read()
            compile(content, 'app/schemas/product.py', 'exec')
        print("✓ Product schema syntax is correct")
    except SyntaxError as e:
        print(f"✗ Product schema syntax error: {e}")
        return False
    
    try:
        # Test wishlist_item schema syntax
        with open('app/schemas/wishlist_item.py', 'r') as f:
            content = f.read()
            compile(content, 'app/schemas/wishlist_item.py', 'exec')
        print("✓ Wishlist item schema syntax is correct")
    except SyntaxError as e:
        print(f"✗ Wishlist item schema syntax error: {e}")
        return False
    
    try:
        # Test wishlist_item model syntax
        with open('app/models/wishlist_item.py', 'r') as f:
            content = f.read()
            compile(content, 'app/models/wishlist_item.py', 'exec')
        print("✓ Wishlist item model syntax is correct")
    except SyntaxError as e:
        print(f"✗ Wishlist item model syntax error: {e}")
        return False
    
    try:
        # Test test_schemas.py syntax
        with open('test_schemas.py', 'r') as f:
            content = f.read()
            compile(content, 'test_schemas.py', 'exec')
        print("✓ Test schemas syntax is correct")
    except SyntaxError as e:
        print(f"✗ Test schemas syntax error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Testing syntax...")
    success = test_syntax()
    if success:
        print("✓ All syntax tests passed!")
    else:
        print("✗ Some syntax tests failed!")
    print("Syntax test completed!") 