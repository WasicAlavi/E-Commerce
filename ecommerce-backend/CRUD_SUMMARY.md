# E-commerce API CRUD Operations Summary

## Overview
All CRUD operations have been implemented using raw SQL with asyncpg, providing comprehensive database operations for the entire e-commerce application. Each CRUD file includes create, read, update, delete operations along with advanced queries and business logic.

## Database Layer (`app/db/`)

### 1. Base Database Operations (`base.py`)
- **`get_db_pool()`**: Get database connection pool
- **`execute_query()`**: Execute single query and return result
- **`execute_many()`**: Execute query and return multiple results
- **`execute_transaction()`**: Execute multiple queries in transaction

### 2. Session Management (`session.py`)
- **`get_db_session()`**: Get database session for dependency injection
- **`get_db_transaction()`**: Get database transaction for dependency injection

### 3. Database Initialization (`init_db.py`)
- **`init_database()`**: Initialize database connection

## CRUD Operations (`app/crud/`)

### 1. User Management

#### User CRUD (`user_crud.py`)
- **`create_user()`**: Create new user with password hashing
- **`get_user_by_id()`**: Get user by ID
- **`get_user_by_username()`**: Get user by username
- **`get_user_by_email()`**: Get user by email
- **`get_users()`**: Get all users
- **`update_user()`**: Update user profile
- **`delete_user()`**: Delete user
- **`authenticate_user()`**: Authenticate user with password

#### Customer CRUD (`customer_crud.py`)
- **`create_customer()`**: Create new customer
- **`get_customer_by_id()`**: Get customer by ID
- **`get_customer_by_user_id()`**: Get customer by user ID
- **`get_customers()`**: Get all customers with pagination
- **`update_customer()`**: Update customer details
- **`delete_customer()`**: Delete customer
- **`get_customer_with_user_details()`**: Get customer with user info
- **`get_customer_statistics()`**: Get customer statistics
- **`search_customers()`**: Search customers by name/email

#### Address CRUD (`address.py`)
- **`create_address()`**: Create new address
- **`get_address_by_id()`**: Get address by ID
- **`get_addresses_by_customer()`**: Get customer addresses
- **`update_address()`**: Update address
- **`delete_address()`**: Delete address
- **`set_default_address()`**: Set default address

### 2. Product Management

#### Product CRUD (`product_crud.py`)
- **`create_product()`**: Create new product
- **`get_product_by_id()`**: Get product by ID
- **`get_products()`**: Get all products
- **`search_products()`**: Search products by name
- **`get_products_by_price_range()`**: Get products in price range
- **`get_products_in_stock()`**: Get products in stock
- **`update_product()`**: Update product
- **`delete_product()`**: Delete product
- **`update_product_stock()`**: Update product stock

#### Product Image CRUD
- **`add_product_image()`**: Add image to product
- **`get_product_images()`**: Get all product images
- **`get_product_primary_image()`**: Get primary image
- **`set_product_image_as_primary()`**: Set image as primary
- **`delete_product_image()`**: Delete product image

#### Product Tag CRUD
- **`add_tag_to_product()`**: Add tag to product
- **`get_product_tags()`**: Get product tags
- **`remove_tag_from_product()`**: Remove tag from product
- **`get_products_by_tag()`**: Get products by tag

#### Tag CRUD
- **`create_tag()`**: Create new tag
- **`get_tags()`**: Get all tags
- **`get_tag_by_name()`**: Get tag by name

### 3. Order Management

#### Order CRUD (`order_crud.py`)
- **`create_order()`**: Create new order
- **`get_order_by_id()`**: Get order by ID
- **`get_orders()`**: Get all orders with pagination
- **`get_orders_by_customer()`**: Get customer orders
- **`get_orders_by_status()`**: Get orders by status
- **`update_order()`**: Update order
- **`delete_order()`**: Delete order
- **`get_order_with_items()`**: Get order with items
- **`get_order_with_details()`**: Get order with customer/payment details

#### Order Item CRUD
- **`add_order_item()`**: Add item to order
- **`get_order_items()`**: Get order items
- **`update_order_item()`**: Update order item
- **`delete_order_item()`**: Delete order item
- **`get_order_item_with_product()`**: Get item with product details

### 4. Shopping Cart

#### Cart CRUD (`cart_crud.py`)
- **`create_cart()`**: Create new cart
- **`get_cart_by_id()`**: Get cart by ID
- **`get_cart_by_customer()`**: Get customer cart
- **`get_carts()`**: Get all carts
- **`delete_cart()`**: Delete cart
- **`get_cart_with_items()`**: Get cart with items
- **`get_cart_with_details()`**: Get cart with details
- **`clear_cart()`**: Clear cart items
- **`get_cart_total()`**: Get cart total

#### Cart Item CRUD
- **`add_cart_item()`**: Add item to cart
- **`get_cart_item_by_id()`**: Get cart item by ID
- **`get_cart_items()`**: Get cart items
- **`update_cart_item_quantity()`**: Update item quantity
- **`remove_cart_item()`**: Remove item from cart
- **`get_cart_item_with_product()`**: Get item with product details
- **`check_cart_item_exists()`**: Check if item exists in cart

### 5. Payment & Financial

#### Payment Method CRUD (`payment_crud.py`)
- **`create_payment_method()`**: Create payment method
- **`get_payment_method_by_id()`**: Get payment method by ID
- **`get_payment_methods_by_customer()`**: Get customer payment methods
- **`get_default_payment_method()`**: Get default payment method
- **`get_payment_methods()`**: Get all payment methods
- **`update_payment_method()`**: Update payment method
- **`delete_payment_method()`**: Delete payment method
- **`set_default_payment_method()`**: Set as default
- **`get_payment_methods_by_type()`**: Get by type
- **`validate_payment_method()`**: Validate ownership

#### Discount CRUD (`discount_crud.py`)
- **`create_discount()`**: Create new discount
- **`get_discount_by_id()`**: Get discount by ID
- **`get_discounts_by_product()`**: Get product discounts
- **`get_active_discounts()`**: Get active discounts
- **`get_discounts()`**: Get all discounts
- **`update_discount()`**: Update discount
- **`delete_discount()`**: Delete discount
- **`get_discount_with_product()`**: Get with product details
- **`get_active_discounts_by_product()`**: Get active product discounts
- **`calculate_discounted_price()`**: Calculate discounted price
- **`activate_discount()`**: Activate discount
- **`deactivate_discount()`**: Deactivate discount
- **`get_expired_discounts()`**: Get expired discounts
- **`get_upcoming_discounts()`**: Get upcoming discounts
- **`get_discounts_by_type()`**: Get by type

#### Coupon CRUD (`coupon_crud.py`)
- **`create_coupon()`**: Create new coupon
- **`get_coupon_by_id()`**: Get coupon by ID
- **`get_coupon_by_code()`**: Get coupon by code
- **`get_coupons()`**: Get all coupons
- **`get_active_coupons()`**: Get active coupons
- **`update_coupon()`**: Update coupon
- **`delete_coupon()`**: Delete coupon
- **`validate_coupon()`**: Validate coupon for customer
- **`apply_coupon()`**: Apply coupon discount
- **`get_coupon_usage_stats()`**: Get usage statistics
- **`activate_coupon()`**: Activate coupon
- **`deactivate_coupon()`**: Deactivate coupon
- **`get_expired_coupons()`**: Get expired coupons
- **`get_upcoming_coupons()`**: Get upcoming coupons

#### Coupon Redeem CRUD
- **`redeem_coupon()`**: Redeem coupon
- **`get_coupon_redemptions()`**: Get coupon redemptions
- **`get_customer_coupon_history()`**: Get customer redemption history
- **`check_coupon_already_redeemed()`**: Check if already redeemed

### 6. User Experience

#### Review CRUD (`review_crud.py`)
- **`create_review()`**: Create new review
- **`get_review_by_id()`**: Get review by ID
- **`get_reviews_by_product()`**: Get product reviews
- **`get_reviews_by_customer()`**: Get customer reviews
- **`get_reviews()`**: Get all reviews
- **`update_review()`**: Update review
- **`delete_review()`**: Delete review
- **`get_review_with_customer()`**: Get with customer details
- **`get_review_with_product()`**: Get with product details
- **`get_product_rating_stats()`**: Get rating statistics
- **`get_average_rating()`**: Get average rating
- **`get_reviews_by_rating()`**: Get by specific rating
- **`check_customer_review_exists()`**: Check if customer reviewed
- **`get_recent_reviews()`**: Get recent reviews
- **`get_helpful_reviews()`**: Get helpful reviews

#### Wishlist CRUD (`wishlist_crud.py`)
- **`create_wishlist()`**: Create new wishlist
- **`get_wishlist_by_id()`**: Get wishlist by ID
- **`get_wishlist_by_customer()`**: Get customer wishlist
- **`get_wishlists()`**: Get all wishlists
- **`delete_wishlist()`**: Delete wishlist
- **`get_wishlist_with_items()`**: Get with items
- **`get_wishlist_with_details()`**: Get with details
- **`clear_wishlist()`**: Clear wishlist items
- **`get_wishlist_item_count()`**: Get item count
- **`move_to_cart()`**: Move item to cart

#### Wishlist Item CRUD
- **`add_wishlist_item()`**: Add item to wishlist
- **`get_wishlist_item_by_id()`**: Get item by ID
- **`get_wishlist_items()`**: Get wishlist items
- **`remove_wishlist_item()`**: Remove item
- **`get_wishlist_item_with_product()`**: Get with product details
- **`check_wishlist_item_exists()`**: Check if item exists

### 7. Admin Management

#### Admin CRUD (`admin_crud.py`)
- **`create_admin()`**: Create new admin
- **`get_admin_by_id()`**: Get admin by ID
- **`get_admin_by_user_id()`**: Get admin by user ID
- **`get_admins()`**: Get all admins
- **`get_admins_by_role()`**: Get admins by role
- **`get_active_admins()`**: Get active admins
- **`update_admin()`**: Update admin
- **`delete_admin()`**: Delete admin
- **`get_admin_with_user_details()`**: Get with user details
- **`check_admin_permissions()`**: Check permissions
- **`activate_admin()`**: Activate admin
- **`deactivate_admin()`**: Deactivate admin
- **`get_admin_statistics()`**: Get statistics
- **`search_admins()`**: Search admins
- **`get_admin_activity_log()`**: Get activity log

## Common Features Across All CRUD Operations

### Database Operations:
- **Raw SQL**: All operations use raw SQL with asyncpg
- **Connection Pooling**: Efficient database connection management
- **Transactions**: Support for complex multi-query operations
- **Error Handling**: Proper error handling and rollback

### Business Logic:
- **Validation**: Input validation and business rule enforcement
- **Relationships**: Proper handling of foreign key relationships
- **Statistics**: Aggregation and statistical queries
- **Search**: Full-text search and filtering capabilities

### Performance:
- **Pagination**: Support for large dataset pagination
- **Indexing**: Optimized queries with proper indexing
- **Caching**: Ready for caching layer implementation
- **Async Operations**: Non-blocking database operations

## Usage Examples

### Creating a Product with Images and Tags:
```python
# Create product
product = await create_product(product_data)

# Add images
for image_url in product_data.images:
    await add_product_image(ProductImageCreate(
        product_id=product.id,
        image_url=image_url,
        is_primary=False
    ))

# Add tags
for tag_name in product_data.tags:
    await add_tag_to_product(product.id, tag_name)
```

### Processing an Order:
```python
# Create order
order = await create_order(order_data)

# Add items
for item in order_data.items:
    await add_order_item(OrderItemCreate(
        order_id=order.id,
        product_id=item.product_id,
        quantity=item.quantity,
        price=item.price
    ))

# Clear cart
await clear_cart(customer.cart_id)
```

### Applying Discounts and Coupons:
```python
# Calculate discounted price
discounted_price = await calculate_discounted_price(product_id, original_price)

# Validate and apply coupon
coupon_validation = await validate_coupon(coupon_data)
if coupon_validation['valid']:
    final_price = await apply_coupon(coupon_code, discounted_price)
```

All CRUD operations are now ready for use in FastAPI routes and provide comprehensive database functionality for the entire e-commerce application! 