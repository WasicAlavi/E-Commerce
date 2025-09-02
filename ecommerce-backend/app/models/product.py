# app/models/product.py

import json
from typing import List, Optional, Dict, Any
from app.database import get_db_connection
from app.models.product_tag import ProductTag
from app.models.tag import Tag

class Product:
    def __init__(self, id: int, name: str, description: str, price: float, stock: int, 
                 brand: Optional[str] = None, material: Optional[str] = None, 
                 colors: Optional[List[str]] = None, sizes: Optional[List[str]] = None,
                 care_instructions: Optional[str] = None, features: Optional[List[str]] = None,
                 specifications: Optional[Dict[str, Any]] = None, views: int = 0,
                 purchase_count: int = 0, add_to_cart_count: int = 0):
        self.id = id
        self.name = name
        self.description = description
        self.price = price
        self.stock = stock
        self.brand = brand
        self.material = material
        self.colors = colors or []
        self.sizes = sizes or []
        self.care_instructions = care_instructions
        self.features = features or []
        self.specifications = specifications or {}
        self.views = views
        self.purchase_count = purchase_count
        self.add_to_cart_count = add_to_cart_count

    @classmethod
    async def create_table(cls):
        """Create products table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS products (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR NOT NULL,
                    description TEXT NOT NULL,
                    price DECIMAL(10,2) NOT NULL,
                    stock INTEGER NOT NULL DEFAULT 0,
                    brand VARCHAR(100),
                    material TEXT,
                    colors JSONB DEFAULT '[]',
                    sizes JSONB DEFAULT '[]',
                    care_instructions TEXT,
                    features JSONB DEFAULT '[]',
                    specifications JSONB DEFAULT '{}',
                    views INTEGER DEFAULT 0,
                    purchase_count INTEGER DEFAULT 0,
                    add_to_cart_count INTEGER DEFAULT 0
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_products_views ON products(views)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_products_purchase_count ON products(purchase_count)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_products_add_to_cart_count ON products(add_to_cart_count)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, name: str, description: str, price: float, stock: int = 0,
                    brand: Optional[str] = None, material: Optional[str] = None,
                    colors: Optional[List[str]] = None, sizes: Optional[List[str]] = None,
                    care_instructions: Optional[str] = None, features: Optional[List[str]] = None,
                    specifications: Optional[Dict[str, Any]] = None) -> 'Product':
        """Create a new product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Ensure proper data types for JSONB fields and convert to JSON strings
            colors_data = json.dumps(colors if colors is not None else [])
            sizes_data = json.dumps(sizes if sizes is not None else [])
            features_data = json.dumps(features if features is not None else [])
            specifications_data = json.dumps(specifications if specifications is not None else {})
            
            row = await conn.fetchrow("""
                INSERT INTO products (name, description, price, stock, brand, material, 
                                    colors, sizes, care_instructions, features, specifications,
                                    views, purchase_count, add_to_cart_count)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING id, name, description, price, stock, brand, material, 
                         colors, sizes, care_instructions, features, specifications,
                         views, purchase_count, add_to_cart_count
            """, name, description, price, stock, brand, material, 
                 colors_data, sizes_data, care_instructions, 
                 features_data, specifications_data, 0, 0, 0)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, product_id: int) -> Optional['Product']:
        """Get product by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, name, description, price, stock, brand, material, 
                       colors, sizes, care_instructions, features, specifications,
                       views, purchase_count, add_to_cart_count
                FROM products WHERE id = $1
            """, product_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_name(cls, name: str) -> Optional['Product']:
        """Get product by name"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, name, description, price, stock, brand, material, 
                       colors, sizes, care_instructions, features, specifications,
                       views, purchase_count, add_to_cart_count
                FROM products WHERE name = $1
            """, name)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_all(cls) -> List['Product']:
        """Get all products"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, name, description, price, stock, brand, material, 
                       colors, sizes, care_instructions, features, specifications
                FROM products ORDER BY id
            """)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def search_by_name(cls, search_term: str) -> List['Product']:
        """Search products by name"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, name, description, price, stock, brand, material, 
                       colors, sizes, care_instructions, features, specifications
                FROM products 
                WHERE name ILIKE $1
                ORDER BY name
            """, f"%{search_term}%")
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_price_range(cls, min_price: float, max_price: float) -> List['Product']:
        """Get products within price range"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, name, description, price, stock, brand, material, 
                       colors, sizes, care_instructions, features, specifications
                FROM products 
                WHERE price BETWEEN $1 AND $2
                ORDER BY price
            """, min_price, max_price)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_in_stock(cls) -> List['Product']:
        """Get products that are in stock"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, name, description, price, stock, brand, material, 
                       colors, sizes, care_instructions, features, specifications
                FROM products 
                WHERE stock > 0
                ORDER BY name
            """)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_products_for_card(cls, limit: int = 20, offset: int = 0, 
                                   sort_by: str = 'name', sort_order: str = 'asc',
                                   min_price: float = None, max_price: float = None) -> List[Dict[str, Any]]:
        """Get products with all information needed for ProductCard component"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Build WHERE clause
            where_conditions = []
            params = []
            param_count = 0
            
            if min_price is not None:
                param_count += 1
                where_conditions.append(f"p.price >= ${param_count}")
                params.append(min_price)
            
            if max_price is not None:
                param_count += 1
                where_conditions.append(f"p.price <= ${param_count}")
                params.append(max_price)
            
            # Build WHERE clause string
            where_clause = f"WHERE {' AND '.join(where_conditions)}" if where_conditions else ""
            
            # Build ORDER BY clause
            order_clause = "ORDER BY "
            if sort_by == 'price':
                order_clause += f"p.price {sort_order.upper()}"
            elif sort_by == 'name':
                order_clause += f"p.name {sort_order.upper()}"
            elif sort_by == 'rating':
                order_clause += f"rating {sort_order.upper()}"
            else:
                order_clause += "p.name ASC"
            
            # Add limit and offset
            param_count += 1
            params.extend([limit, offset])
            
            query = f"""
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    p.price,
                    p.stock,
                    COALESCE(pi.image_url, 'https://via.placeholder.com/300x300?text=No+Image') as image,
                    COALESCE(d.value / 100.0, 0.0) as discount,
                    COALESCE(AVG(r.rating), 0.0) as rating,
                    COALESCE(COUNT(r.id), 0) as total_reviews
                FROM products p
                LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                LEFT JOIN discounts d ON p.id = d.product_id 
                    AND d.start_date <= CURRENT_DATE 
                    AND d.end_date >= CURRENT_DATE
                    AND d.discount_type = 'percentage'
                LEFT JOIN reviews r ON p.id = r.product_id
                {where_clause}
                GROUP BY p.id, p.name, p.description, p.price, p.stock, pi.image_url, d.value
                {order_clause}
                LIMIT ${param_count} OFFSET ${param_count + 1}
            """
            
            rows = await conn.fetch(query, *params)
            return [dict(row) for row in rows]

    @classmethod
    async def get_products_count(cls, min_price: float = None, max_price: float = None) -> int:
        """Get total count of products for pagination"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Build WHERE clause
            where_conditions = []
            params = []
            param_count = 0
            
            if min_price is not None:
                param_count += 1
                where_conditions.append(f"p.price >= ${param_count}")
                params.append(min_price)
            
            if max_price is not None:
                param_count += 1
                where_conditions.append(f"p.price <= ${param_count}")
                params.append(max_price)
            
            # Build WHERE clause string
            where_clause = f"WHERE {' AND '.join(where_conditions)}" if where_conditions else ""
            
            query = f"""
                SELECT COUNT(DISTINCT p.id) as total
                FROM products p
                {where_clause}
            """
            
            row = await conn.fetchrow(query, *params)
            return row['total'] if row else 0

    @classmethod
    async def search_products_count(cls, search_term: str, min_price: float = None, max_price: float = None) -> int:
        """Get total count of search results for pagination"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Build WHERE clause
            where_conditions = ["p.name ILIKE $1"]
            params = [f"%{search_term}%"]
            param_count = 1
            
            if min_price is not None:
                param_count += 1
                where_conditions.append(f"p.price >= ${param_count}")
                params.append(min_price)
            
            if max_price is not None:
                param_count += 1
                where_conditions.append(f"p.price <= ${param_count}")
                params.append(max_price)
            
            query = f"""
                SELECT COUNT(DISTINCT p.id) as total
                FROM products p
                WHERE {' AND '.join(where_conditions)}
            """
            
            row = await conn.fetchrow(query, *params)
            return row['total'] if row else 0

    @classmethod
    async def get_product_for_card(cls, product_id: int) -> Optional[Dict[str, Any]]:
        """Get a single product with all information needed for ProductCard component"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    p.price,
                    p.stock,
                    COALESCE(pi.image_url, 'https://via.placeholder.com/300x300?text=No+Image') as image,
                    COALESCE(d.value / 100.0, 0.0) as discount,
                    COALESCE(AVG(r.rating), 0.0) as rating,
                    COALESCE(COUNT(r.id), 0) as total_reviews
                FROM products p
                LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                LEFT JOIN discounts d ON p.id = d.product_id 
                    AND d.start_date <= CURRENT_DATE 
                    AND d.end_date >= CURRENT_DATE
                    AND d.discount_type = 'percentage'
                LEFT JOIN reviews r ON p.id = r.product_id
                WHERE p.id = $1
                GROUP BY p.id, p.name, p.description, p.price, p.stock, pi.image_url, d.value
            """, product_id)
            if not row:
                return None
            product = dict(row)
            # Fetch tags (categories)
            tags = await ProductTag.get_tags_for_product(product_id)
            product['category'] = tags[0] if tags else None
            return product

    @classmethod
    async def search_products_for_card(cls, search_term: str, limit: int = 20, offset: int = 0, 
                                      sort_by: str = 'name', sort_order: str = 'asc',
                                      min_price: float = None, max_price: float = None) -> List[Dict[str, Any]]:
        """Search products with all information needed for ProductCard component"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Build WHERE clause
            where_conditions = ["p.name ILIKE $1"]
            params = [f"%{search_term}%"]
            param_count = 1
            
            if min_price is not None:
                param_count += 1
                where_conditions.append(f"p.price >= ${param_count}")
                params.append(min_price)
            
            if max_price is not None:
                param_count += 1
                where_conditions.append(f"p.price <= ${param_count}")
                params.append(max_price)
            
            # Build ORDER BY clause
            order_clause = "ORDER BY "
            if sort_by == 'price':
                order_clause += f"p.price {sort_order.upper()}"
            elif sort_by == 'name':
                order_clause += f"p.name {sort_order.upper()}"
            elif sort_by == 'rating':
                order_clause += f"rating {sort_order.upper()}"
            else:
                order_clause += "p.name ASC"
            
            # Add limit and offset
            param_count += 1
            params.extend([limit, offset])
            
            query = f"""
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    p.price,
                    p.stock,
                    COALESCE(pi.image_url, 'https://via.placeholder.com/300x300?text=No+Image') as image,
                    COALESCE(d.value / 100.0, 0.0) as discount,
                    COALESCE(AVG(r.rating), 0.0) as rating,
                    COALESCE(COUNT(r.id), 0) as total_reviews
                FROM products p
                LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                LEFT JOIN discounts d ON p.id = d.product_id 
                    AND d.start_date <= CURRENT_DATE 
                    AND d.end_date >= CURRENT_DATE
                    AND d.discount_type = 'percentage'
                LEFT JOIN reviews r ON p.id = r.product_id
                WHERE {' AND '.join(where_conditions)}
                GROUP BY p.id, p.name, p.description, p.price, p.stock, pi.image_url, d.value
                {order_clause}
                LIMIT ${param_count} OFFSET ${param_count + 1}
            """
            
            rows = await conn.fetch(query, *params)
            return [dict(row) for row in rows]

    @classmethod
    async def get_products_for_compare(cls, product_ids: List[int]) -> List[Dict[str, Any]]:
        """Get products with all information needed for CompareProducts component"""
        if not product_ids:
            return []
            
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Create placeholders for the IN clause
            placeholders = ','.join([f'${i+1}' for i in range(len(product_ids))])
            
            query = f"""
                SELECT 
                    p.id,
                    p.name,
                    p.price,
                    p.stock,
                    p.brand,
                    p.material,
                    p.colors,
                    p.sizes,
                    p.care_instructions,
                    p.features,
                    p.specifications,
                    COALESCE(pi.image_url, 'https://via.placeholder.com/300x300?text=No+Image') as image,
                    COALESCE(d.value / 100.0, 0.0) as discount,
                    COALESCE(AVG(r.rating), 0.0) as rating,
                    COALESCE(COUNT(r.id), 0) as total_reviews
                FROM products p
                LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                LEFT JOIN discounts d ON p.id = d.product_id 
                    AND d.start_date <= CURRENT_DATE 
                    AND d.end_date >= CURRENT_DATE
                    AND d.discount_type = 'percentage'
                LEFT JOIN reviews r ON p.id = r.product_id
                WHERE p.id IN ({placeholders})
                GROUP BY p.id, p.name, p.price, p.stock, p.brand, p.material, 
                         p.colors, p.sizes, p.care_instructions, p.features, 
                         p.specifications, pi.image_url, d.value
                ORDER BY p.id
            """
            
            rows = await conn.fetch(query, *product_ids)
            products = []
            
            for row in rows:
                product = dict(row)
                
                # Ensure JSONB fields are properly parsed
                if isinstance(product['colors'], str):
                    try:
                        import json
                        product['colors'] = json.loads(product['colors']) if product['colors'] else []
                    except:
                        product['colors'] = []
                
                if isinstance(product['sizes'], str):
                    try:
                        import json
                        product['sizes'] = json.loads(product['sizes']) if product['sizes'] else []
                    except:
                        product['sizes'] = []
                
                if isinstance(product['features'], str):
                    try:
                        import json
                        product['features'] = json.loads(product['features']) if product['features'] else []
                    except:
                        product['features'] = []
                
                if isinstance(product['specifications'], str):
                    try:
                        import json
                        product['specifications'] = json.loads(product['specifications']) if product['specifications'] else {}
                    except:
                        product['specifications'] = {}
                
                # Calculate original price
                product['original_price'] = product['price'] / (1 - product['discount']) if product['discount'] > 0 else product['price']
                
                # Format colors and sizes for display
                product['color'] = ', '.join(product['colors']) if product['colors'] else 'N/A'
                product['size'] = ', '.join(product['sizes']) if product['sizes'] else 'N/A'
                product['care'] = product['care_instructions'] or 'N/A'
                product['reviews'] = product['total_reviews']
                product['inStock'] = product['stock'] > 0
                
                products.append(product)
            
            return products

    @classmethod
    async def get_products_with_highest_discounts(cls, limit: int = 8) -> List[Dict[str, Any]]:
        """Get products with highest discount percentages"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            query = """
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    p.price,
                    p.stock,
                    pi.image_url as image,
                    COALESCE(d.value, 0) / 100.0 as discount,
                    COALESCE(AVG(r.rating), 0.0) as rating,
                    COUNT(r.id) as total_reviews
                FROM products p
                LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                LEFT JOIN discounts d ON p.id = d.product_id 
                    AND d.start_date <= CURRENT_DATE 
                    AND d.end_date >= CURRENT_DATE
                LEFT JOIN reviews r ON p.id = r.product_id
                WHERE d.value > 0
                GROUP BY p.id, p.name, p.description, p.price, p.stock, pi.image_url, discount
                ORDER BY discount DESC
                LIMIT $1
            """
            rows = await conn.fetch(query, limit)
            return [dict(row) for row in rows]

    @classmethod
    async def get_products_with_coupons(cls, limit: int = 8) -> List[Dict[str, Any]]:
        """Get products that have active discounts (since coupons are general)"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            query = """
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    p.price,
                    p.stock,
                    pi.image_url as image,
                    COALESCE(d.value, 0) / 100.0 as discount,
                    COALESCE(AVG(r.rating), 0) as rating,
                    COUNT(r.id) as total_reviews
                FROM products p
                LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                LEFT JOIN discounts d ON p.id = d.product_id 
                    AND d.start_date <= CURRENT_DATE 
                    AND d.end_date >= CURRENT_DATE
                LEFT JOIN reviews r ON p.id = r.product_id
                WHERE d.value > 0
                GROUP BY p.id, p.name, p.description, p.price, p.stock, pi.image_url, discount
                ORDER BY discount DESC
                LIMIT $1
            """
            rows = await conn.fetch(query, limit)
            return [dict(row) for row in rows]

    @classmethod
    async def get_best_sellers(cls, limit: int = 8) -> List[Dict[str, Any]]:
        """Get selling products based on order count"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            query = """
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    p.price,
                    p.stock,
                    pi.image_url as image,
                    COALESCE(d.value, 0) / 100.0 as discount,
                    COALESCE(AVG(r.rating), 0) as rating,
                    COUNT(r.id) as total_reviews,
                    COALESCE(SUM(oi.quantity), 0) as total_sold
                FROM products p
                LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                LEFT JOIN discounts d ON p.id = d.product_id 
                    AND d.start_date <= CURRENT_DATE 
                    AND d.end_date >= CURRENT_DATE
                LEFT JOIN reviews r ON p.id = r.product_id
                LEFT JOIN order_items oi ON p.id = oi.product_id
                LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
                GROUP BY p.id, p.name, p.description, p.price, p.stock, pi.image_url, discount
                ORDER BY discount DESC, total_sold DESC
                LIMIT $1
            """
            rows = await conn.fetch(query, limit)
            return [dict(row) for row in rows]

    @classmethod
    async def get_frequently_bought_together(cls, product_id: int, limit: int = 4) -> List[Dict[str, Any]]:
        """Get products frequently bought together with the given product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                WITH product_orders AS (
                    -- Get all orders that contain the target product
                    SELECT DISTINCT oi.order_id
                    FROM order_items oi
                    WHERE oi.product_id = $1
                ),
                frequently_bought AS (
                    -- Get other products from those orders
                    SELECT DISTINCT
                        p.id,
                        p.name,
                        p.price,
                        p.description,
                        COALESCE(pi.image_url, 'https://via.placeholder.com/100x100?text=No+Image') as image,
                        p.stock,
                        p.average_rating as rating,
                        p.brand,
                        p.material,
                        COALESCE(d.value, 0) as discount,
                        COUNT(*) as co_occurrence_count
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                    LEFT JOIN discounts d ON p.id = d.product_id AND d.start_date <= CURRENT_DATE AND d.end_date >= CURRENT_DATE
                    WHERE oi.order_id IN (SELECT order_id FROM product_orders)
                    AND oi.product_id != $1  -- Exclude the target product itself
                    AND p.stock > 0  -- Only in-stock products
                    GROUP BY p.id, p.name, p.price, p.description, pi.image_url, p.stock, p.average_rating, p.brand, p.material, d.value
                )
                SELECT * FROM frequently_bought
                ORDER BY co_occurrence_count DESC, rating DESC, id
                LIMIT $2
            """, product_id, limit)
            
            # If no frequently bought together data, provide fallback recommendations
            if not rows:
                # Get products from the same category as fallback
                fallback_rows = await conn.fetch("""
                    SELECT DISTINCT
                        p.id,
                        p.name,
                        p.price,
                        p.description,
                        COALESCE(pi.image_url, 'https://via.placeholder.com/100x100?text=No+Image') as image,
                        p.stock,
                        p.average_rating as rating,
                        p.brand,
                        p.material,
                        COALESCE(d.value, 0) as discount
                    FROM products p
                    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                    LEFT JOIN discounts d ON p.id = d.product_id AND d.start_date <= CURRENT_DATE AND d.end_date >= CURRENT_DATE
                    WHERE p.id != $1  -- Exclude the target product itself
                    AND p.stock > 0  -- Only in-stock products
                    ORDER BY p.average_rating DESC, p.id
                    LIMIT $2
                """, product_id, limit)
                
                return [dict(row) for row in fallback_rows]
            
            return [dict(row) for row in rows]

    @classmethod
    async def get_similar_products(cls, product_id: int, limit: int = 4) -> List[Dict[str, Any]]:
        """Get similar products based on brand, price range, and tags"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # First get the target product details
            product_row = await conn.fetchrow("""
                SELECT p.*
                FROM products p
                WHERE p.id = $1
            """, product_id)
            
            if not product_row:
                return []
            
            product = dict(product_row)
            
            # Get similar products
            rows = await conn.fetch("""
                SELECT DISTINCT
                    p.id,
                    p.name,
                    p.price,
                    p.description,
                    COALESCE(pi.image_url, 'https://via.placeholder.com/100x100?text=No+Image') as image,
                    p.stock,
                    p.average_rating as rating,
                    p.brand,
                    p.material,
                    COALESCE(d.value / 100.0, 0.0) as discount,
                    -- Calculate similarity score
                    CASE WHEN p.brand = $2 THEN 3 ELSE 0 END +  -- Same brand
                    CASE WHEN ABS(p.price - $3) <= $3 * 0.3 THEN 2 ELSE 0 END +  -- Similar price range (±30%)
                    CASE WHEN p.average_rating >= 4.0 THEN 1 ELSE 0 END  -- High rating
                    as similarity_score
                FROM products p
                LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                LEFT JOIN discounts d ON p.id = d.product_id AND d.start_date <= CURRENT_DATE AND d.end_date >= CURRENT_DATE
                WHERE p.id != $1  -- Exclude the original product
                AND p.stock > 0  -- Only in-stock products
                ORDER BY similarity_score DESC, p.average_rating DESC, p.id
                LIMIT $4
            """, product_id, product.get('brand'), product.get('price', 0), limit)
            
            return [dict(row) for row in rows]

    @classmethod
    async def get_customer_recommendations(cls, customer_id: int, limit: int = 8) -> List[Dict[str, Any]]:
        """Get personalized product recommendations for a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                WITH customer_purchases AS (
                    -- Get customer's purchase history
                    SELECT 
                        oi.product_id,
                        COUNT(*) as purchase_count,
                        SUM(oi.quantity) as total_quantity,
                        AVG(p.price) as avg_price,
                        STRING_AGG(DISTINCT p.brand, ', ') as preferred_brands
                    FROM order_items oi
                    JOIN orders o ON oi.order_id = o.id
                    JOIN products p ON oi.product_id = p.id
                    WHERE o.customer_id = $1
                    GROUP BY oi.product_id
                ),
                customer_preferences AS (
                    SELECT 
                        AVG(avg_price) as avg_price_preference,
                        STRING_AGG(DISTINCT preferred_brands, ', ') as all_brands
                    FROM customer_purchases
                ),
                recommended_products AS (
                    SELECT DISTINCT
                        p.id,
                        p.name,
                        p.price,
                        p.description,
                        COALESCE(pi.image_url, 'https://via.placeholder.com/100x100?text=No+Image') as image,
                        p.stock,
                        p.average_rating as rating,
                        p.brand,
                        p.material,
                        COALESCE(d.value / 100.0, 0.0) as discount,
                        -- Calculate recommendation score
                        CASE WHEN p.brand = ANY(STRING_TO_ARRAY(cp.all_brands, ', ')) THEN 3 ELSE 0 END +  -- Preferred brand
                        CASE WHEN ABS(p.price - cp.avg_price_preference) <= cp.avg_price_preference * 0.5 THEN 2 ELSE 0 END +  -- Similar price range
                        CASE WHEN p.average_rating >= 4.0 THEN 1 ELSE 0 END +  -- High rating
                        CASE WHEN p.stock > 0 THEN 1 ELSE 0 END  -- In stock
                        as recommendation_score
                    FROM products p
                    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                    LEFT JOIN discounts d ON p.id = d.product_id AND d.start_date <= CURRENT_DATE AND d.end_date >= CURRENT_DATE
                    CROSS JOIN customer_preferences cp
                    WHERE p.id NOT IN (SELECT product_id FROM customer_purchases)  -- Exclude already purchased
                    AND p.stock > 0  -- Only in-stock products
                )
                SELECT * FROM recommended_products
                ORDER BY recommendation_score DESC, rating DESC, id
                LIMIT $2
            """, customer_id, limit)
            
            return [dict(row) for row in rows]

    @classmethod
    async def get_trending_products(cls, limit: int = 8) -> List[Dict[str, Any]]:
        """Get trending products based on recent orders and popularity"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                WITH recent_orders AS (
                    -- Get products from recent orders (last 30 days)
                    SELECT 
                        oi.product_id,
                        COUNT(*) as order_count,
                        SUM(oi.quantity) as total_quantity
                    FROM order_items oi
                    JOIN orders o ON oi.order_id = o.id
                    WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days'
                    GROUP BY oi.product_id
                ),
                trending_products AS (
                    SELECT DISTINCT
                        p.id,
                        p.name,
                        p.price,
                        p.description,
                        COALESCE(pi.image_url, 'https://via.placeholder.com/100x100?text=No+Image') as image,
                        p.stock,
                        p.average_rating as rating,
                        p.brand,
                        p.material,
                        COALESCE(d.value / 100.0, 0.0) as discount,
                        COALESCE(ro.order_count, 0) as recent_orders,
                        COALESCE(ro.total_quantity, 0) as total_quantity,
                        -- Calculate trending score
                        COALESCE(ro.order_count, 0) * 3 +  -- Recent orders weight
                        COALESCE(ro.total_quantity, 0) * 2 +  -- Total quantity weight
                        CASE WHEN p.average_rating >= 4.0 THEN 2 ELSE 0 END +  -- High rating bonus
                        CASE WHEN p.stock > 0 THEN 1 ELSE 0 END  -- In stock bonus
                        as trending_score
                    FROM products p
                    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                    LEFT JOIN discounts d ON p.id = d.product_id AND d.start_date <= CURRENT_DATE AND d.end_date >= CURRENT_DATE
                    LEFT JOIN recent_orders ro ON p.id = ro.product_id
                    WHERE p.stock > 0  -- Only in-stock products
                )
                SELECT * FROM trending_products
                ORDER BY trending_score DESC, rating DESC, id
                LIMIT $1
            """, limit)
            
            return [dict(row) for row in rows]

    async def update(self, name: str = None, description: str = None, 
                    price: float = None, stock: int = None, brand: str = None,
                    material: str = None, colors: List[str] = None, sizes: List[str] = None,
                    care_instructions: str = None, features: List[str] = None,
                    specifications: Dict[str, Any] = None) -> 'Product':
        """Update product fields"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            updates = []
            values = []
            param_count = 1
            
            if name is not None:
                updates.append(f"name = ${param_count}")
                values.append(name)
                param_count += 1
            if description is not None:
                updates.append(f"description = ${param_count}")
                values.append(description)
                param_count += 1
            if price is not None:
                updates.append(f"price = ${param_count}")
                values.append(price)
                param_count += 1
            if stock is not None:
                updates.append(f"stock = ${param_count}")
                values.append(stock)
                param_count += 1
            if brand is not None:
                updates.append(f"brand = ${param_count}")
                values.append(brand)
                param_count += 1
            if material is not None:
                updates.append(f"material = ${param_count}")
                values.append(material)
                param_count += 1
            if colors is not None:
                updates.append(f"colors = ${param_count}")
                values.append(json.dumps(colors))
                param_count += 1
            if sizes is not None:
                updates.append(f"sizes = ${param_count}")
                values.append(json.dumps(sizes))
                param_count += 1
            if care_instructions is not None:
                updates.append(f"care_instructions = ${param_count}")
                values.append(care_instructions)
                param_count += 1
            if features is not None:
                updates.append(f"features = ${param_count}")
                values.append(json.dumps(features))
                param_count += 1
            if specifications is not None:
                updates.append(f"specifications = ${param_count}")
                values.append(json.dumps(specifications))
                param_count += 1

            if not updates:
                return self

            values.append(self.id)
            query = f"""
                UPDATE products 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, name, description, price, stock, brand, material, 
                         colors, sizes, care_instructions, features, specifications
            """
            
            row = await conn.fetchrow(query, *values)
            if row:
                return self.__class__(**dict(row))
            return self

    async def update_stock(self, quantity: int) -> 'Product':
        """Update product stock"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE products 
                SET stock = stock + $1
                WHERE id = $2
                RETURNING id, name, description, price, stock, brand, material, 
                         colors, sizes, care_instructions, features, specifications
            """, quantity, self.id)
            if row:
                return self.__class__(**dict(row))
            return self

    async def delete(self) -> bool:
        """Delete product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM products WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert product to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'stock': self.stock,
            'brand': self.brand,
            'material': self.material,
            'colors': self.colors,
            'sizes': self.sizes,
            'care_instructions': self.care_instructions,
            'features': self.features,
            'specifications': self.specifications
        }
