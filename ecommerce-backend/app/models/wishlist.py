from typing import List, Optional, Dict, Any
from app.database import get_db_connection

class Wishlist:
    def __init__(self, id: int, customer_id: int):
        self.id = id
        self.customer_id = customer_id

    @classmethod
    async def create_table(cls):
        """Create wishlists table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS wishlists (
                    id SERIAL PRIMARY KEY,
                    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE
                )
            """)
            # Create index
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_wishlists_customer ON wishlists(customer_id)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, customer_id: int) -> 'Wishlist':
        """Create a new wishlist"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO wishlists (customer_id)
                VALUES ($1)
                RETURNING id, customer_id
            """, customer_id)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, wishlist_id: int, include_deleted: bool = False) -> Optional['Wishlist']:
        """Get wishlist by ID, excluding deleted by default"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            query = "SELECT id, customer_id FROM wishlists WHERE id = $1"
            params = [wishlist_id]
            if not include_deleted:
                query += " AND is_deleted = FALSE"
            row = await conn.fetchrow(query, *params)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_customer_id(cls, customer_id: int, include_deleted: bool = False) -> Optional['Wishlist']:
        """Get wishlist for a customer, excluding deleted by default"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            query = "SELECT id, customer_id FROM wishlists WHERE customer_id = $1"
            params = [customer_id]
            if not include_deleted:
                query += " AND is_deleted = FALSE"
            query += " ORDER BY id LIMIT 1"
            row = await conn.fetchrow(query, *params)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_or_create_by_customer(cls, customer_id: int) -> 'Wishlist':
        """Get existing wishlist or create new one for customer"""
        wishlist = await cls.get_by_customer_id(customer_id)
        if not wishlist:
            wishlist = await cls.create(customer_id)
        return wishlist

    async def delete(self) -> bool:
        """Soft delete wishlist"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute(
                "UPDATE wishlists SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1",
                self.id
            )
            return result.startswith("UPDATE")

    async def clear_items(self) -> bool:
        """Clear all items from wishlist"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM wishlist_items WHERE wishlist_id = $1", self.id)
            return result.startswith("DELETE")

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "items": []  # Will be populated by get_with_items method
        }

    async def get_with_items(self) -> Dict[str, Any]:
        """Get wishlist with items"""
        from app.models.wishlist_item import WishlistItem
        
        wishlist_dict = self.to_dict()
        items = await WishlistItem.get_by_wishlist_id(self.id)
        wishlist_dict["items"] = [item.to_dict() for item in items]
        return wishlist_dict
