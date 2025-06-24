-- Dummy Data for E-commerce Database
-- This script creates sample data for testing ProductCard functionality

-- =====================================================
-- 1. PRODUCTS TABLE
-- =====================================================
INSERT INTO products (name, description, price, stock) VALUES
('iPhone 15 Pro', 'Latest iPhone with advanced camera system and A17 Pro chip', 999.99, 50),
('Samsung Galaxy S24', 'Premium Android smartphone with AI features', 899.99, 35),
('MacBook Air M2', 'Lightweight laptop with powerful M2 chip', 1199.99, 25),
('Dell XPS 13', 'Ultra-thin laptop with InfinityEdge display', 1099.99, 30),
('Sony WH-1000XM5', 'Premium noise-cancelling headphones', 349.99, 40),
('Apple Watch Series 9', 'Advanced smartwatch with health monitoring', 399.99, 60),
('iPad Air', 'Versatile tablet with M1 chip', 599.99, 45),
('Nike Air Max 270', 'Comfortable running shoes with Air cushioning', 150.00, 100),
('Adidas Ultraboost 22', 'High-performance running shoes', 180.00, 75),
('Canon EOS R6', 'Professional mirrorless camera', 2499.99, 15),
('Sony A7 III', 'Full-frame mirrorless camera', 1999.99, 20),
('DJI Mini 3 Pro', 'Compact drone with 4K camera', 759.99, 30),
('GoPro Hero 11', 'Action camera with 5.3K video', 399.99, 50),
('Bose QuietComfort 45', 'Premium noise-cancelling headphones', 329.99, 40),
('Samsung 65" QLED TV', '4K Smart TV with Quantum Dot technology', 1299.99, 10),
('LG 55" OLED TV', 'Premium OLED TV with perfect blacks', 1499.99, 8),
('PlayStation 5', 'Next-gen gaming console', 499.99, 25),
('Xbox Series X', 'Powerful gaming console', 499.99, 20),
('Nintendo Switch OLED', 'Hybrid gaming console', 349.99, 35),
('Microsoft Surface Pro 9', '2-in-1 laptop and tablet', 999.99, 20);

-- =====================================================
-- 2. TAGS TABLE (Categories)
-- =====================================================
INSERT INTO tags (name) VALUES
('Smartphones'),
('Laptops'),
('Headphones'),
('Smartwatches'),
('Tablets'),
('Shoes'),
('Cameras'),
('Drones'),
('TVs'),
('Gaming'),
('Accessories');

-- =====================================================
-- 3. PRODUCT_TAGS TABLE (Product-Category Relationships)
-- =====================================================
INSERT INTO product_tags (product_id, tag_id) VALUES
-- Smartphones
(1, 1), (2, 1),
-- Laptops
(3, 2), (4, 2), (19, 2),
-- Headphones
(5, 3), (14, 3),
-- Smartwatches
(6, 4),
-- Tablets
(7, 5),
-- Shoes
(8, 6), (9, 6),
-- Cameras
(10, 7), (11, 7), (13, 7),
-- Drones
(12, 8),
-- TVs
(15, 9), (16, 9),
-- Gaming
(17, 10), (18, 10), (19, 10),
-- Accessories
(5, 11), (6, 11), (13, 11), (14, 11);

-- =====================================================
-- 4. PRODUCT_IMAGES TABLE
-- =====================================================
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
-- iPhone 15 Pro
(1, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop', true),
(1, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&crop=face', false),
(1, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&crop=entropy', false),

-- Samsung Galaxy S24
(2, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', true),
(2, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=face', false),

-- MacBook Air M2
(3, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop', true),
(3, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=face', false),

-- Dell XPS 13
(4, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', true),

-- Sony WH-1000XM5
(5, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', true),

-- Apple Watch Series 9
(6, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', true),

-- iPad Air
(7, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop', true),

-- Nike Air Max 270
(8, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', true),

-- Adidas Ultraboost 22
(9, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop', true),

-- Canon EOS R6
(10, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop', true),

-- Sony A7 III
(11, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop', true),

-- DJI Mini 3 Pro
(12, 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=400&h=400&fit=crop', true),

-- GoPro Hero 11
(13, 'https://images.unsplash.com/photo-1574944985070-8b3b3a2e1c3b?w=400&h=400&fit=crop', true),

-- Bose QuietComfort 45
(14, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', true),

-- Samsung 65" QLED TV
(15, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop', true),

-- LG 55" OLED TV
(16, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop', true),

-- PlayStation 5
(17, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop', true),

-- Xbox Series X
(18, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop', true),

-- Nintendo Switch OLED
(19, 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop', true),

-- Microsoft Surface Pro 9
(20, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', true);

-- =====================================================
-- 5. DISCOUNTS TABLE
-- =====================================================
INSERT INTO discounts (product_id, discount_type, value, start_date, end_date) VALUES
-- iPhone 15 Pro - 15% off
(1, 'percentage', 15.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),

-- Samsung Galaxy S24 - 10% off
(2, 'percentage', 10.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days'),

-- MacBook Air M2 - 20% off
(3, 'percentage', 20.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days'),

-- Dell XPS 13 - 12% off
(4, 'percentage', 12.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '25 days'),

-- Sony WH-1000XM5 - 25% off
(5, 'percentage', 25.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '40 days'),

-- Apple Watch Series 9 - 8% off
(6, 'percentage', 8.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '35 days'),

-- iPad Air - 18% off
(7, 'percentage', 18.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '50 days'),

-- Nike Air Max 270 - 30% off
(8, 'percentage', 30.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '20 days'),

-- Adidas Ultraboost 22 - 22% off
(9, 'percentage', 22.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),

-- Canon EOS R6 - 5% off
(10, 'percentage', 5.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days'),

-- Sony A7 III - 12% off
(11, 'percentage', 12.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days'),

-- DJI Mini 3 Pro - 15% off
(12, 'percentage', 15.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),

-- GoPro Hero 11 - 20% off
(13, 'percentage', 20.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '25 days'),

-- Bose QuietComfort 45 - 10% off
(14, 'percentage', 10.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '40 days'),

-- Samsung 65" QLED TV - 8% off
(15, 'percentage', 8.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days'),

-- LG 55" OLED TV - 15% off
(16, 'percentage', 15.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '35 days'),

-- PlayStation 5 - 0% off (no discount)
-- Xbox Series X - 0% off (no discount)
-- Nintendo Switch OLED - 0% off (no discount)
-- Microsoft Surface Pro 9 - 0% off (no discount)

-- =====================================================
-- 6. CUSTOMERS TABLE (for reviews)
-- =====================================================
INSERT INTO customers (first_name, last_name, email, phone) VALUES
('John', 'Doe', 'john.doe@email.com', '+1234567890'),
('Jane', 'Smith', 'jane.smith@email.com', '+1234567891'),
('Mike', 'Johnson', 'mike.johnson@email.com', '+1234567892'),
('Sarah', 'Williams', 'sarah.williams@email.com', '+1234567893'),
('David', 'Brown', 'david.brown@email.com', '+1234567894'),
('Emily', 'Davis', 'emily.davis@email.com', '+1234567895'),
('Chris', 'Wilson', 'chris.wilson@email.com', '+1234567896'),
('Lisa', 'Anderson', 'lisa.anderson@email.com', '+1234567897'),
('Tom', 'Taylor', 'tom.taylor@email.com', '+1234567898'),
('Amy', 'Thomas', 'amy.thomas@email.com', '+1234567899');

-- =====================================================
-- 7. REVIEWS TABLE
-- =====================================================
INSERT INTO reviews (customer_id, product_id, rating, comment, review_date) VALUES
-- iPhone 15 Pro reviews
(1, 1, 5, 'Amazing camera quality and performance!', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(2, 1, 4, 'Great phone but expensive', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(3, 1, 5, 'Best iPhone I have ever owned', CURRENT_TIMESTAMP - INTERVAL '15 days'),
(4, 1, 4, 'Excellent battery life', CURRENT_TIMESTAMP - INTERVAL '20 days'),
(5, 1, 5, 'Perfect for photography', CURRENT_TIMESTAMP - INTERVAL '25 days'),

-- Samsung Galaxy S24 reviews
(6, 2, 4, 'Great AI features', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(7, 2, 5, 'Excellent display quality', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(8, 2, 4, 'Good performance overall', CURRENT_TIMESTAMP - INTERVAL '12 days'),

-- MacBook Air M2 reviews
(9, 3, 5, 'Incredible performance and battery life', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(10, 3, 5, 'Perfect for work and creativity', CURRENT_TIMESTAMP - INTERVAL '14 days'),
(1, 3, 4, 'Great laptop, wish it had more ports', CURRENT_TIMESTAMP - INTERVAL '21 days'),

-- Dell XPS 13 reviews
(2, 4, 4, 'Beautiful design and good performance', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(3, 4, 5, 'Excellent build quality', CURRENT_TIMESTAMP - INTERVAL '11 days'),

-- Sony WH-1000XM5 reviews
(4, 5, 5, 'Best noise cancellation ever', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(5, 5, 5, 'Amazing sound quality', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(6, 5, 4, 'Great headphones, comfortable for long use', CURRENT_TIMESTAMP - INTERVAL '16 days'),

-- Apple Watch Series 9 reviews
(7, 6, 5, 'Perfect health monitoring', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(8, 6, 4, 'Great fitness tracking', CURRENT_TIMESTAMP - INTERVAL '13 days'),

-- iPad Air reviews
(9, 7, 5, 'Perfect for drawing and note-taking', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(10, 7, 4, 'Great tablet, good performance', CURRENT_TIMESTAMP - INTERVAL '17 days'),

-- Nike Air Max 270 reviews
(1, 8, 5, 'Very comfortable for running', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(2, 8, 4, 'Good cushioning, stylish design', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(3, 8, 5, 'Perfect for daily wear', CURRENT_TIMESTAMP - INTERVAL '18 days'),

-- Adidas Ultraboost 22 reviews
(4, 9, 5, 'Excellent running shoes', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(5, 9, 4, 'Great energy return', CURRENT_TIMESTAMP - INTERVAL '14 days'),

-- Canon EOS R6 reviews
(6, 10, 5, 'Professional quality photos', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(7, 10, 5, 'Amazing autofocus system', CURRENT_TIMESTAMP - INTERVAL '15 days'),

-- Sony A7 III reviews
(8, 11, 4, 'Great camera for the price', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(9, 11, 5, 'Excellent low-light performance', CURRENT_TIMESTAMP - INTERVAL '19 days'),

-- DJI Mini 3 Pro reviews
(10, 12, 5, 'Amazing drone, easy to fly', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(1, 12, 4, 'Great camera quality', CURRENT_TIMESTAMP - INTERVAL '13 days'),

-- GoPro Hero 11 reviews
(2, 13, 5, 'Perfect for action shots', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(3, 13, 4, 'Great video quality', CURRENT_TIMESTAMP - INTERVAL '16 days'),

-- Bose QuietComfort 45 reviews
(4, 14, 5, 'Excellent noise cancellation', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(5, 14, 4, 'Comfortable for long flights', CURRENT_TIMESTAMP - INTERVAL '11 days'),

-- Samsung 65" QLED TV reviews
(6, 15, 5, 'Amazing picture quality', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(7, 15, 4, 'Great smart TV features', CURRENT_TIMESTAMP - INTERVAL '14 days'),

-- LG 55" OLED TV reviews
(8, 16, 5, 'Perfect blacks and colors', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(9, 16, 5, 'Best TV I have ever owned', CURRENT_TIMESTAMP - INTERVAL '17 days'),

-- PlayStation 5 reviews
(10, 17, 5, 'Incredible gaming performance', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(1, 17, 4, 'Great graphics and loading times', CURRENT_TIMESTAMP - INTERVAL '12 days'),

-- Xbox Series X reviews
(2, 18, 5, 'Amazing gaming console', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(3, 18, 4, 'Great Game Pass integration', CURRENT_TIMESTAMP - INTERVAL '15 days'),

-- Nintendo Switch OLED reviews
(4, 19, 5, 'Perfect for family gaming', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(5, 19, 4, 'Great portable gaming', CURRENT_TIMESTAMP - INTERVAL '13 days'),

-- Microsoft Surface Pro 9 reviews
(6, 20, 4, 'Great 2-in-1 device', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(7, 20, 5, 'Perfect for work and creativity', CURRENT_TIMESTAMP - INTERVAL '16 days');

-- =====================================================
-- SUMMARY
-- =====================================================
-- This script creates:
-- - 20 products with realistic names, descriptions, and prices
-- - 11 categories (tags)
-- - Product-category relationships
-- - Product images with real Unsplash URLs
-- - Active discounts for most products (15 products have discounts)
-- - 10 customers
-- - 50+ reviews with realistic ratings and comments
-- 
-- Products with discounts: 1-16 (iPhone to LG TV)
-- Products without discounts: 17-20 (PS5, Xbox, Switch, Surface)
-- 
-- All discounts are active (current date to future dates)
-- All reviews have ratings between 4-5 stars for realistic data 