# app/models/customer.py

from typing import List, Optional, Dict, Any
from app.database import get_db_connection

class Customer:
    def __init__(self, id: int, user_id: int):
        self.id = id
        self.user_id = user_id

    @classmethod
    async def create_table(cls):
        """Create customers table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS customers (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
                )
            """)

    @classmethod
    async def create(cls, user_id: int) -> 'Customer':
        """Create a new customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO customers (user_id)
                VALUES ($1)
                RETURNING id, user_id
            """, user_id)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, customer_id: int) -> Optional['Customer']:
        """Get customer by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, user_id
                FROM customers WHERE id = $1
            """, customer_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_user_id(cls, user_id: int) -> Optional['Customer']:
        """Get customer by user ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, user_id
                FROM customers WHERE user_id = $1
            """, user_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_all(cls) -> List['Customer']:
        """Get all customers"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, user_id
                FROM customers
            """)
            return [cls(**dict(row)) for row in rows]

    async def delete(self) -> bool:
        """Delete customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM customers WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id
        }

