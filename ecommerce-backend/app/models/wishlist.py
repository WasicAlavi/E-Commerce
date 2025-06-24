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
    async def get_by_id(cls, wishlist_id: int) -> Optional['Wishlist']:
        """Get wishlist by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, customer_id
                FROM wishlists WHERE id = $1
            """, wishlist_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_customer_id(cls, customer_id: int) -> Optional['Wishlist']:
        """Get wishlist for a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, customer_id
                FROM wishlists 
                WHERE customer_id = $1
                ORDER BY id
                LIMIT 1
            """, customer_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_or_create_by_customer(cls, customer_id: int) -> 'Wishlist':
        """Get existing wishlist or create new one for customer"""
        wishlist = await cls.get_by_customer_id(customer_id)
        if not wishlist:
            wishlist = await cls.create(customer_id)
        return wishlist

    async def delete(self) -> bool:
        """Delete wishlist"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM wishlists WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "customer_id": self.customer_id
        }
