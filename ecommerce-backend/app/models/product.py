# app/models/product.py

from typing import List, Optional, Dict, Any
from app.database import get_db_connection
from app.models.product_tag import ProductTag
from app.models.tag import Tag

class Product:
    def __init__(self, id: int, name: str, description: str, price: float, stock: int):
        self.id = id
        self.name = name
        self.description = description
        self.price = price
        self.stock = stock

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
                    stock INTEGER NOT NULL DEFAULT 0
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, name: str, description: str, price: float, stock: int = 0) -> 'Product':
        """Create a new product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO products (name, description, price, stock)
                VALUES ($1, $2, $3, $4)
                RETURNING id, name, description, price, stock
            """, name, description, price, stock)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, product_id: int) -> Optional['Product']:
        """Get product by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, name, description, price, stock
                FROM products WHERE id = $1
            """, product_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_name(cls, name: str) -> Optional['Product']:
        """Get product by name"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, name, description, price, stock
                FROM products WHERE name = $1
            """, name)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_all(cls) -> List['Product']:
        """Get all products"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, name, description, price, stock
                FROM products ORDER BY id
            """)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def search_by_name(cls, search_term: str) -> List['Product']:
        """Search products by name"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, name, description, price, stock
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
                SELECT id, name, description, price, stock
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
                SELECT id, name, description, price, stock
                FROM products 
                WHERE stock > 0
                ORDER BY name
            """)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_products_for_card(cls, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        """Get products with all information needed for ProductCard component"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
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
                GROUP BY p.id, p.name, p.description, p.price, p.stock, pi.image_url, d.value
                ORDER BY p.id
                LIMIT $1 OFFSET $2
            """, limit, offset)
            return [dict(row) for row in rows]

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
    async def search_products_for_card(cls, search_term: str, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        """Search products with all information needed for ProductCard component"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
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
                WHERE p.name ILIKE $1
                GROUP BY p.id, p.name, p.description, p.price, p.stock, pi.image_url, d.value
                ORDER BY p.name
                LIMIT $2 OFFSET $3
            """, f"%{search_term}%", limit, offset)
            return [dict(row) for row in rows]

    async def update(self, name: str = None, description: str = None, 
                    price: float = None, stock: int = None) -> 'Product':
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

            if not updates:
                return self

            values.append(self.id)
            query = f"""
                UPDATE products 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, name, description, price, stock
            """
            
            row = await conn.fetchrow(query, *values)
            return Product(**dict(row))

    async def update_stock(self, quantity: int) -> 'Product':
        """Update product stock (add or subtract)"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE products 
                SET stock = stock + $1
                WHERE id = $2
                RETURNING id, name, description, price, stock
            """, quantity, self.id)
            return Product(**dict(row))

    async def delete(self) -> bool:
        """Delete product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM products WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": float(self.price),
            "stock": self.stock
        }
