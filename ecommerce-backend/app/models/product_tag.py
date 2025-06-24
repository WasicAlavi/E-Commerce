# app/models/product_tag.py

from typing import List, Optional, Dict, Any
from app.database import get_db_connection

class ProductTag:
    def __init__(self, id: int, product_id: int, tag_id: int):
        self.id = id
        self.product_id = product_id
        self.tag_id = tag_id

    @classmethod
    async def create_table(cls):
        """Create product_tags table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS product_tags (
                    id SERIAL PRIMARY KEY,
                    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
                    UNIQUE(product_id, tag_id)
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_product_tags_product ON product_tags(product_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_product_tags_tag ON product_tags(tag_id)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, product_id: int, tag_id: int) -> 'ProductTag':
        """Create a new product-tag association"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO product_tags (product_id, tag_id)
                VALUES ($1, $2)
                RETURNING id, product_id, tag_id
            """, product_id, tag_id)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, product_tag_id: int) -> Optional['ProductTag']:
        """Get product-tag by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, product_id, tag_id
                FROM product_tags WHERE id = $1
            """, product_tag_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_product_id(cls, product_id: int) -> List['ProductTag']:
        """Get all tags for a product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, product_id, tag_id
                FROM product_tags WHERE product_id = $1
            """, product_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_tag_id(cls, tag_id: int) -> List['ProductTag']:
        """Get all products for a tag"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, product_id, tag_id
                FROM product_tags WHERE tag_id = $1
            """, tag_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_products_by_tag_name(cls, tag_name: str) -> List[int]:
        """Get product IDs that have a specific tag"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT pt.product_id
                FROM product_tags pt
                JOIN tags t ON pt.tag_id = t.id
                WHERE t.tag_name = $1
            """, tag_name)
            return [row['product_id'] for row in rows]

    @classmethod
    async def get_tags_for_product(cls, product_id: int) -> List[str]:
        """Get tag names for a specific product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT t.tag_name
                FROM product_tags pt
                JOIN tags t ON pt.tag_id = t.id
                WHERE pt.product_id = $1
            """, product_id)
            return [row['tag_name'] for row in rows]

    async def delete(self) -> bool:
        """Delete product-tag association"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM product_tags WHERE id = $1", self.id)
            return result == "DELETE 1"

    @classmethod
    async def delete_by_product_and_tag(cls, product_id: int, tag_id: int) -> bool:
        """Delete specific product-tag association"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("""
                DELETE FROM product_tags 
                WHERE product_id = $1 AND tag_id = $2
            """, product_id, tag_id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "product_id": self.product_id,
            "tag_id": self.tag_id
        }
