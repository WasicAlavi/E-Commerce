#!/usr/bin/env python3
"""
Test script to verify API endpoints return correct ProductCard data
"""

import json
import requests

def test_api_endpoints():
    """Test the new API endpoints for ProductCard data"""
    base_url = "http://localhost:8000/api/v1"
    
    print("Testing API endpoints for ProductCard data...")
    print("=" * 60)
    
    # Test 1: Get products for card
    try:
        print("1. Testing GET /products/card")
        response = requests.get(f"{base_url}/products/card?per_page=5")
        
        if response.status_code == 200:
            data = response.json()
            print("✓ GET /products/card successful")
            print(f"  - Status: {response.status_code}")
            print(f"  - Products returned: {len(data.get('products', []))}")
            
            if data.get('products'):
                first_product = data['products'][0]
                print("  - First product fields:")
                for key, value in first_product.items():
                    print(f"    * {key}: {value} (type: {type(value).__name__})")
                
                # Check for required fields
                required_fields = ['id', 'name', 'description', 'price', 'stock', 'image', 'discount', 'rating', 'total_reviews']
                missing_fields = [field for field in required_fields if field not in first_product]
                
                if missing_fields:
                    print(f"  ✗ Missing fields: {missing_fields}")
                else:
                    print("  ✓ All required fields present")
                    
                # Check for NaN values
                def check_nan_in_dict(data):
                    for key, value in data.items():
                        if isinstance(value, (int, float)) and (value != value):  # NaN check
                            print(f"    ✗ Found NaN in {key}: {value}")
                            return True
                    return False
                
                if not check_nan_in_dict(first_product):
                    print("  ✓ No NaN values found")
                else:
                    print("  ✗ NaN values found")
                    
        else:
            print(f"✗ GET /products/card failed: {response.status_code}")
            print(f"  Response: {response.text}")
            
    except Exception as e:
        print(f"✗ GET /products/card error: {e}")
    
    print()
    
    # Test 2: Get featured products
    try:
        print("2. Testing GET /products/card/featured")
        response = requests.get(f"{base_url}/products/card/featured?limit=3")
        
        if response.status_code == 200:
            data = response.json()
            print("✓ GET /products/card/featured successful")
            print(f"  - Status: {response.status_code}")
            print(f"  - Products returned: {len(data)}")
            
            if data:
                first_product = data[0]
                print("  - First product has required fields:")
                required_fields = ['id', 'name', 'description', 'price', 'stock', 'image', 'discount', 'rating', 'total_reviews']
                for field in required_fields:
                    if field in first_product:
                        print(f"    ✓ {field}: {first_product[field]}")
                    else:
                        print(f"    ✗ {field}: missing")
        else:
            print(f"✗ GET /products/card/featured failed: {response.status_code}")
            print(f"  Response: {response.text}")
            
    except Exception as e:
        print(f"✗ GET /products/card/featured error: {e}")
    
    print()
    
    # Test 3: Get products by tag (this is what your frontend is calling)
    try:
        print("3. Testing GET /products/card/by_tag/{tag_id}")
        # Try with tag_id = 1 (assuming it exists)
        response = requests.get(f"{base_url}/products/card/by_tag/1")
        
        if response.status_code == 200:
            data = response.json()
            print("✓ GET /products/card/by_tag/1 successful")
            print(f"  - Status: {response.status_code}")
            print(f"  - Products returned: {len(data)}")
            
            if data:
                first_product = data[0]
                print("  - First product fields:")
                for key, value in first_product.items():
                    print(f"    * {key}: {value} (type: {type(value).__name__})")
                
                # Check for required fields
                required_fields = ['id', 'name', 'description', 'price', 'stock', 'image', 'discount', 'rating', 'total_reviews']
                missing_fields = [field for field in required_fields if field not in first_product]
                
                if missing_fields:
                    print(f"  ✗ Missing fields: {missing_fields}")
                else:
                    print("  ✓ All required fields present")
                    
                # Check for NaN values
                def check_nan_in_dict(data):
                    for key, value in data.items():
                        if isinstance(value, (int, float)) and (value != value):  # NaN check
                            print(f"    ✗ Found NaN in {key}: {value}")
                            return True
                    return False
                
                if not check_nan_in_dict(first_product):
                    print("  ✓ No NaN values found")
                else:
                    print("  ✗ NaN values found")
                    
        elif response.status_code == 404:
            print("⚠ GET /products/card/by_tag/1 returned 404 (tag not found)")
            print("  This is expected if tag_id=1 doesn't exist in your database")
        else:
            print(f"✗ GET /products/card/by_tag/1 failed: {response.status_code}")
            print(f"  Response: {response.text}")
            
    except Exception as e:
        print(f"✗ GET /products/card/by_tag/1 error: {e}")
    
    print()
    
    # Test 4: Compare with old endpoint
    try:
        print("4. Comparing with old endpoint GET /products/by_tag/{tag_id}")
        response = requests.get(f"{base_url}/products/by_tag/1")
        
        if response.status_code == 200:
            data = response.json()
            print("✓ GET /products/by_tag/1 successful")
            print(f"  - Status: {response.status_code}")
            print(f"  - Products returned: {len(data)}")
            
            if data:
                first_product = data[0]
                print("  - Old endpoint fields:")
                for key, value in first_product.items():
                    print(f"    * {key}: {value} (type: {type(value).__name__})")
                
                # Check what's missing compared to ProductCard
                productcard_fields = ['image', 'discount', 'rating', 'total_reviews']
                missing_fields = [field for field in productcard_fields if field not in first_product]
                
                if missing_fields:
                    print(f"  ✗ Missing ProductCard fields: {missing_fields}")
                else:
                    print("  ✓ All ProductCard fields present")
        else:
            print(f"✗ GET /products/by_tag/1 failed: {response.status_code}")
            
    except Exception as e:
        print(f"✗ GET /products/by_tag/1 error: {e}")

def show_frontend_integration():
    """Show how to update the frontend to use the new endpoints"""
    print("\n" + "=" * 60)
    print("FRONTEND INTEGRATION GUIDE")
    print("=" * 60)
    
    print("\n1. Update your API call in Home/index.jsx:")
    print("   Change from:")
    print("   fetch(`http://localhost:8000/api/v1/products/by_tag/${selectedCategory.id}`)")
    print("   To:")
    print("   fetch(`http://localhost:8000/api/v1/products/card/by_tag/${selectedCategory.id}`)")
    
    print("\n2. The new endpoint will return data like this:")
    example_data = {
        "id": 1,
        "name": "Sample Product",
        "description": "Product description",
        "price": 100.00,
        "stock": 10,
        "image": "https://via.placeholder.com/300x300?text=Sample+Product",
        "discount": 0.2,
        "rating": 4.5,
        "total_reviews": 25
    }
    print(json.dumps(example_data, indent=2))
    
    print("\n3. Your ProductCard component will now receive:")
    print("   - image: Product image URL (with fallback)")
    print("   - discount: Discount percentage (0.0 to 1.0)")
    print("   - rating: Average rating (0.0 to 5.0)")
    print("   - total_reviews: Number of reviews")
    
    print("\n4. Available new endpoints:")
    print("   - GET /api/v1/products/card - Get all products for cards")
    print("   - GET /api/v1/products/card/{id} - Get single product for card")
    print("   - GET /api/v1/products/card/by_tag/{tag_id} - Get products by tag for cards")
    print("   - GET /api/v1/products/card/featured - Get featured products for cards")

if __name__ == "__main__":
    test_api_endpoints()
    show_frontend_integration()
    
    print("\n" + "=" * 60)
    print("TEST COMPLETED")
    print("=" * 60) 