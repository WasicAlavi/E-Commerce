# app/models/product_image.py

from typing import List, Optional, Dict, Any
from app.database import get_db_connection

class ProductImage:
    def __init__(self, id: int, product_id: int, image_url: str, is_primary: bool = False):
        self.id = id
        self.product_id = product_id
        self.image_url = image_url
        self.is_primary = is_primary

    @classmethod
    async def create_table(cls):
        """Create product_images table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS product_images (
                    id SERIAL PRIMARY KEY,
                    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                    image_url VARCHAR NOT NULL,
                    is_primary BOOLEAN DEFAULT FALSE
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(is_primary)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, product_id: int, image_url: str, is_primary: bool = False) -> 'ProductImage':
        """Create a new product image"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # If this is primary, unset other primary images for this product
            if is_primary:
                await conn.execute("""
                    UPDATE product_images 
                    SET is_primary = FALSE 
                    WHERE product_id = $1
                """, product_id)
            
            row = await conn.fetchrow("""
                INSERT INTO product_images (product_id, image_url, is_primary)
                VALUES ($1, $2, $3)
                RETURNING id, product_id, image_url, is_primary
            """, product_id, image_url, is_primary)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, image_id: int) -> Optional['ProductImage']:
        """Get product image by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, product_id, image_url, is_primary
                FROM product_images WHERE id = $1
            """, image_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_product_id(cls, product_id: int) -> List['ProductImage']:
        """Get all images for a product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, product_id, image_url, is_primary
                FROM product_images 
                WHERE product_id = $1
                ORDER BY is_primary DESC, id
            """, product_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_primary_image(cls, product_id: int) -> Optional['ProductImage']:
        """Get primary image for a product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, product_id, image_url, is_primary
                FROM product_images 
                WHERE product_id = $1 AND is_primary = TRUE
            """, product_id)
            return cls(**dict(row)) if row else None

    async def update(self, image_url: str = None, is_primary: bool = None) -> 'ProductImage':
        """Update product image fields"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            updates = []
            values = []
            param_count = 1
            
            if image_url is not None:
                updates.append(f"image_url = ${param_count}")
                values.append(image_url)
                param_count += 1
            if is_primary is not None:
                updates.append(f"is_primary = ${param_count}")
                values.append(is_primary)
                param_count += 1

            if not updates:
                return self

            # If setting as primary, unset other primary images for this product
            if is_primary:
                await conn.execute("""
                    UPDATE product_images 
                    SET is_primary = FALSE 
                    WHERE product_id = $1 AND id != $2
                """, self.product_id, self.id)

            values.append(self.id)
            query = f"""
                UPDATE product_images 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, product_id, image_url, is_primary
            """
            
            row = await conn.fetchrow(query, *values)
            return ProductImage(**dict(row))

    async def set_as_primary(self) -> 'ProductImage':
        """Set this image as primary for the product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Unset other primary images for this product
            await conn.execute("""
                UPDATE product_images 
                SET is_primary = FALSE 
                WHERE product_id = $1
            """, self.product_id)
            
            # Set this image as primary
            row = await conn.fetchrow("""
                UPDATE product_images 
                SET is_primary = TRUE
                WHERE id = $1
                RETURNING id, product_id, image_url, is_primary
            """, self.id)
            return ProductImage(**dict(row))

    async def delete(self) -> bool:
        """Delete product image"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM product_images WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "product_id": self.product_id,
            "image_url": self.image_url,
            "is_primary": self.is_primary
        }
