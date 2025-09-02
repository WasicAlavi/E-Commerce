from typing import List, Optional, Dict, Any
from app.database import get_db_connection

class WishlistItem:
    def __init__(self, id: int, wishlist_id: int, product_id: int):
        self.id = id
        self.wishlist_id = wishlist_id
        self.product_id = product_id

    @classmethod
    async def create_table(cls):
        """Create wishlist_items table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS wishlist_items (
                    id SERIAL PRIMARY KEY,
                    wishlist_id INTEGER NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
                    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                    UNIQUE(wishlist_id, product_id)
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist ON wishlist_items(wishlist_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_wishlist_items_product ON wishlist_items(product_id)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, wishlist_id: int, product_id: int) -> 'WishlistItem':
        """Add a product to wishlist"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            try:
                # Check if wishlist exists
                wishlist_exists = await conn.fetchval("SELECT EXISTS(SELECT 1 FROM wishlists WHERE id = $1)", wishlist_id)
                if not wishlist_exists:
                    raise Exception(f"Wishlist {wishlist_id} does not exist")
                
                # Check if product exists
                product_exists = await conn.fetchval("SELECT EXISTS(SELECT 1 FROM products WHERE id = $1)", product_id)
                if not product_exists:
                    raise Exception(f"Product {product_id} does not exist")
                
                # First check if the item already exists
                exists = await cls.check_exists(wishlist_id, product_id)
                if exists:
                    raise Exception(f"Product {product_id} already exists in wishlist {wishlist_id}")
                
                row = await conn.fetchrow("""
                    INSERT INTO wishlist_items (wishlist_id, product_id)
                    VALUES ($1, $2)
                    RETURNING id, wishlist_id, product_id
                """, wishlist_id, product_id)
                
                if not row:
                    raise Exception("Failed to create wishlist item")
                    
                return cls(**dict(row))
            except Exception as e:
                print(f"Error creating wishlist item: {e}")
                raise e

    @classmethod
    async def get_by_id(cls, item_id: int, include_deleted: bool = False) -> Optional['WishlistItem']:
        """Get wishlist item by ID, excluding deleted by default"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            query = "SELECT id, wishlist_id, product_id FROM wishlist_items WHERE id = $1"
            params = [item_id]
            if not include_deleted:
                query += " AND is_deleted = FALSE"
            row = await conn.fetchrow(query, *params)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_wishlist_id(cls, wishlist_id: int, include_deleted: bool = False) -> List['WishlistItem']:
        """Get all items in a wishlist, excluding deleted by default"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            query = "SELECT id, wishlist_id, product_id FROM wishlist_items WHERE wishlist_id = $1"
            params = [wishlist_id]
            if not include_deleted:
                query += " AND is_deleted = FALSE"
            query += " ORDER BY id"
            rows = await conn.fetch(query, *params)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_customer_id(cls, customer_id: int) -> List['WishlistItem']:
        """Get all wishlist items for a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT wi.id, wi.wishlist_id, wi.product_id
                FROM wishlist_items wi
                JOIN wishlists w ON wi.wishlist_id = w.id
                WHERE w.customer_id = $1
                ORDER BY wi.id
            """, customer_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_product_id(cls, product_id: int) -> List['WishlistItem']:
        """Get all wishlist items for a specific product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, wishlist_id, product_id
                FROM wishlist_items 
                WHERE product_id = $1
                ORDER BY id
            """, product_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def check_exists(cls, wishlist_id: int, product_id: int) -> bool:
        """Check if product exists in wishlist"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.fetchval("""
                SELECT EXISTS(
                    SELECT 1 FROM wishlist_items 
                    WHERE wishlist_id = $1 AND product_id = $2
                )
            """, wishlist_id, product_id)
            return bool(result)

    @classmethod
    async def get_by_wishlist_and_product(cls, wishlist_id: int, product_id: int) -> Optional['WishlistItem']:
        """Get wishlist item by wishlist_id and product_id"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, wishlist_id, product_id
                FROM wishlist_items 
                WHERE wishlist_id = $1 AND product_id = $2
            """, wishlist_id, product_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_customer_wishlist_products(cls, customer_id: int) -> List[Dict[str, Any]]:
        """Get wishlist products with product details for a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT 
                    wi.id as item_id,
                    wi.wishlist_id,
                    wi.product_id,
                    p.name as product_name,
                    p.description as product_description,
                    p.price as product_price,
                    p.stock as product_stock,
                    p.image_url as product_image
                FROM wishlist_items wi
                JOIN wishlists w ON wi.wishlist_id = w.id
                JOIN products p ON wi.product_id = p.id
                WHERE w.customer_id = $1
                ORDER BY wi.id
            """, customer_id)
            return [dict(row) for row in rows]

    async def delete(self) -> bool:
        """Soft delete item from wishlist"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute(
                "UPDATE wishlist_items SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1",
                self.id
            )
            return result.startswith("UPDATE")

    @classmethod
    async def remove_from_wishlist(cls, wishlist_id: int, product_id: int) -> bool:
        """Soft delete specific product from wishlist"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute(
                "UPDATE wishlist_items SET is_deleted = TRUE, deleted_at = NOW() WHERE wishlist_id = $1 AND product_id = $2",
                wishlist_id, product_id
            )
            return result.startswith("UPDATE")

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "wishlist_id": self.wishlist_id,
            "product_id": self.product_id
        }
