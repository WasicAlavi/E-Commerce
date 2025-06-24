from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database import get_db_connection

class Cart:
    def __init__(self, id: int, customer_id: int, creation_date: datetime, 
                 is_active: bool = True, is_deleted: bool = False):
        self.id = id
        self.customer_id = customer_id
        self.creation_date = creation_date
        self.is_active = is_active
        self.is_deleted = is_deleted

    @classmethod
    async def create_table(cls):
        """Create carts table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS carts (
                    id SERIAL PRIMARY KEY,
                    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
                    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    is_deleted BOOLEAN DEFAULT FALSE
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_carts_customer ON carts(customer_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_carts_active ON carts(is_active)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_carts_deleted ON carts(is_deleted)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, customer_id: int, creation_date: Optional[datetime] = None) -> 'Cart':
        """Create a new cart"""
        if creation_date is None:
            creation_date = datetime.now()
            
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO carts (customer_id, creation_date)
                VALUES ($1, $2)
                RETURNING id, customer_id, creation_date, is_active, is_deleted
            """, customer_id, creation_date)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, cart_id: int) -> Optional['Cart']:
        """Get cart by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, customer_id, creation_date, is_active, is_deleted
                FROM carts WHERE id = $1
            """, cart_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_active_cart_by_customer(cls, customer_id: int) -> Optional['Cart']:
        """Get active cart for a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, customer_id, creation_date, is_active, is_deleted
                FROM carts 
                WHERE customer_id = $1 AND is_active = TRUE AND is_deleted = FALSE
                ORDER BY creation_date DESC
                LIMIT 1
            """, customer_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_all_carts_by_customer(cls, customer_id: int) -> List['Cart']:
        """Get all carts for a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, customer_id, creation_date, is_active, is_deleted
                FROM carts 
                WHERE customer_id = $1
                ORDER BY creation_date DESC
            """, customer_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_active_carts(cls) -> List['Cart']:
        """Get all active carts"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, customer_id, creation_date, is_active, is_deleted
                FROM carts 
                WHERE is_active = TRUE AND is_deleted = FALSE
                ORDER BY creation_date DESC
            """)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_customer_id(cls, customer_id: int) -> Optional['Cart']:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM carts WHERE customer_id = $1 AND is_active = TRUE LIMIT 1",
                customer_id
            )
            return cls(**dict(row)) if row else None

    async def deactivate(self) -> 'Cart':
        """Deactivate cart"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE carts 
                SET is_active = FALSE
                WHERE id = $1
                RETURNING id, customer_id, creation_date, is_active, is_deleted
            """, self.id)
            return Cart(**dict(row))

    async def mark_as_deleted(self) -> 'Cart':
        """Mark cart as deleted"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE carts 
                SET is_deleted = TRUE, is_active = FALSE
                WHERE id = $1
                RETURNING id, customer_id, creation_date, is_active, is_deleted
            """, self.id)
            return Cart(**dict(row))

    async def reactivate(self) -> 'Cart':
        """Reactivate cart"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE carts 
                SET is_active = TRUE, is_deleted = FALSE
                WHERE id = $1
                RETURNING id, customer_id, creation_date, is_active, is_deleted
            """, self.id)
            return Cart(**dict(row))

    async def delete(self) -> bool:
        """Delete cart permanently"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM carts WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "creation_date": self.creation_date.isoformat() if self.creation_date else None,
            "is_active": self.is_active,
            "is_deleted": self.is_deleted
        }
