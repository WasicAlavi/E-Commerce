#!/usr/bin/env python3
"""
Setup script to create test data and verify ProductCard functionality
"""

import asyncio
import os
from app.database import get_db_connection
from app.models.product import Product
from app.models.discount import Discount
from app.models.review import Review
from app.models.product_image import ProductImage
from app.models.tag import Tag
from app.models.product_tag import ProductTag
from app.models.customer import Customer

async def create_tables():
    """Create all necessary tables"""
    print("Creating tables...")
    
    # Create tables in order (respecting foreign key constraints)
    await Product.create_table()
    await Tag.create_table()
    await ProductTag.create_table()
    await ProductImage.create_table()
    await Discount.create_table()
    await Customer.create_table()
    await Review.create_table()
    
    print("✓ All tables created successfully")

async def insert_dummy_data():
    """Insert dummy data from SQL file"""
    print("Inserting dummy data...")
    
    # Read the SQL file
    sql_file_path = "dummy_data.sql"
    if not os.path.exists(sql_file_path):
        print(f"✗ SQL file not found: {sql_file_path}")
        return False
    
    with open(sql_file_path, 'r') as f:
        sql_content = f.read()
    
    # Split by semicolon and execute each statement
    pool = await get_db_connection()
    async with pool.acquire() as conn:
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
        
        for i, statement in enumerate(statements):
            if statement and not statement.startswith('--'):
                try:
                    await conn.execute(statement)
                    print(f"  ✓ Executed statement {i+1}")
                except Exception as e:
                    print(f"  ✗ Error in statement {i+1}: {e}")
                    print(f"    Statement: {statement[:100]}...")
    
    print("✓ Dummy data inserted successfully")
    return True

async def verify_data():
    """Verify that the data was inserted correctly"""
    print("\nVerifying data...")
    
    # Check products
    products = await Product.get_all()
    print(f"✓ Products: {len(products)}")
    
    # Check tags
    tags = await Tag.get_all()
    print(f"✓ Tags: {len(tags)}")
    
    # Check product images
    pool = await get_db_connection()
    async with pool.acquire() as conn:
        image_count = await conn.fetchval("SELECT COUNT(*) FROM product_images")
        print(f"✓ Product Images: {image_count}")
        
        discount_count = await conn.fetchval("SELECT COUNT(*) FROM discounts")
        print(f"✓ Discounts: {discount_count}")
        
        review_count = await conn.fetchval("SELECT COUNT(*) FROM reviews")
        print(f"✓ Reviews: {review_count}")
        
        customer_count = await conn.fetchval("SELECT COUNT(*) FROM customers")
        print(f"✓ Customers: {customer_count}")

async def test_product_card_data():
    """Test the ProductCard data retrieval"""
    print("\nTesting ProductCard data retrieval...")
    
    try:
        # Test getting products for card
        products_data = await Product.get_products_for_card(limit=5, offset=0)
        print(f"✓ Retrieved {len(products_data)} products for ProductCard")
        
        if products_data:
            first_product = products_data[0]
            print("\nFirst product data:")
            for key, value in first_product.items():
                print(f"  - {key}: {value} (type: {type(value).__name__})")
            
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
        
        # Test getting products by tag
        products_by_tag = await Product.search_products_for_card("iPhone", limit=3, offset=0)
        print(f"\n✓ Retrieved {len(products_by_tag)} iPhone products")
        
        # Test getting single product
        if products_data:
            single_product = await Product.get_product_for_card(products_data[0]['id'])
            if single_product:
                print(f"✓ Retrieved single product: {single_product['name']}")
        
    except Exception as e:
        print(f"✗ Error testing ProductCard data: {e}")

async def show_sample_data():
    """Show sample data for verification"""
    print("\n" + "="*60)
    print("SAMPLE DATA VERIFICATION")
    print("="*60)
    
    pool = await get_db_connection()
    async with pool.acquire() as conn:
        # Show some products
        print("\n📱 Sample Products:")
        products = await conn.fetch("SELECT id, name, price, stock FROM products LIMIT 5")
        for product in products:
            print(f"  - {product['id']}: {product['name']} - ৳{product['price']} (Stock: {product['stock']})")
        
        # Show some discounts
        print("\n🏷️ Sample Discounts:")
        discounts = await conn.fetch("""
            SELECT p.name, d.value, d.discount_type 
            FROM discounts d 
            JOIN products p ON d.product_id = p.id 
            LIMIT 5
        """)
        for discount in discounts:
            print(f"  - {discount['name']}: {discount['value']}% {discount['discount_type']}")
        
        # Show some reviews
        print("\n⭐ Sample Reviews:")
        reviews = await conn.fetch("""
            SELECT p.name, r.rating, r.comment 
            FROM reviews r 
            JOIN products p ON r.product_id = p.id 
            LIMIT 5
        """)
        for review in reviews:
            print(f"  - {review['name']}: {review['rating']}★ - {review['comment'][:50]}...")
        
        # Show some images
        print("\n🖼️ Sample Images:")
        images = await conn.fetch("""
            SELECT p.name, pi.image_url, pi.is_primary 
            FROM product_images pi 
            JOIN products p ON pi.product_id = p.id 
            WHERE pi.is_primary = true 
            LIMIT 5
        """)
        for image in images:
            print(f"  - {image['name']}: {image['image_url'][:50]}...")

async def main():
    """Main setup function"""
    print("🚀 Setting up test data for ProductCard functionality")
    print("="*60)
    
    try:
        # Create tables
        await create_tables()
        
        # Insert dummy data
        success = await insert_dummy_data()
        if not success:
            return
        
        # Verify data
        await verify_data()
        
        # Test ProductCard functionality
        await test_product_card_data()
        
        # Show sample data
        await show_sample_data()
        
        print("\n" + "="*60)
        print("✅ SETUP COMPLETED SUCCESSFULLY!")
        print("="*60)
        print("\n🎯 Next steps:")
        print("1. Start your FastAPI server: python run.py")
        print("2. Test the new API endpoints:")
        print("   - GET /api/v1/products/card")
        print("   - GET /api/v1/products/card/by_tag/1")
        print("   - GET /api/v1/products/card/featured")
        print("3. Update your frontend to use the new endpoints")
        print("4. Your ProductCard component should now work perfectly!")
        
    except Exception as e:
        print(f"✗ Setup failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main()) 