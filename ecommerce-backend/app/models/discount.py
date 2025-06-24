# app/models/discount.py

from typing import List, Optional, Dict, Any
from datetime import date, datetime
from enum import Enum
from app.database import get_db_connection

class DiscountTypeEnum(str, Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"

class Discount:
    def __init__(self, id: int, product_id: int, discount_type: str, 
                 value: float, start_date: date, end_date: date):
        self.id = id
        self.product_id = product_id
        self.discount_type = discount_type
        self.value = value
        self.start_date = start_date
        self.end_date = end_date

    @classmethod
    async def create_table(cls):
        """Create discounts table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS discounts (
                    id SERIAL PRIMARY KEY,
                    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
                    value DECIMAL(10,2) NOT NULL CHECK (value > 0),
                    start_date DATE NOT NULL,
                    end_date DATE NOT NULL CHECK (end_date >= start_date)
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_discounts_product ON discounts(product_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_discounts_dates ON discounts(start_date, end_date)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_discounts_type ON discounts(discount_type)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, product_id: int, discount_type: str, value: float, 
                    start_date: date, end_date: date) -> 'Discount':
        """Create a new discount"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO discounts (product_id, discount_type, value, start_date, end_date)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, product_id, discount_type, value, start_date, end_date
            """, product_id, discount_type, value, start_date, end_date)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, discount_id: int) -> Optional['Discount']:
        """Get discount by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, product_id, discount_type, value, start_date, end_date
                FROM discounts WHERE id = $1
            """, discount_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_product_id(cls, product_id: int) -> List['Discount']:
        """Get all discounts for a product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, product_id, discount_type, value, start_date, end_date
                FROM discounts 
                WHERE product_id = $1
                ORDER BY start_date DESC
            """, product_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_active_discounts(cls, current_date: Optional[date] = None) -> List['Discount']:
        """Get all currently active discounts"""
        if current_date is None:
            current_date = date.today()
            
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, product_id, discount_type, value, start_date, end_date
                FROM discounts 
                WHERE start_date <= $1 AND end_date >= $1
                ORDER BY start_date DESC
            """, current_date)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_active_discount_by_product(cls, product_id: int, 
                                            current_date: Optional[date] = None) -> Optional['Discount']:
        """Get active discount for a specific product"""
        if current_date is None:
            current_date = date.today()
            
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, product_id, discount_type, value, start_date, end_date
                FROM discounts 
                WHERE product_id = $1 AND start_date <= $2 AND end_date >= $2
                ORDER BY value DESC
                LIMIT 1
            """, product_id, current_date)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_type(cls, discount_type: str) -> List['Discount']:
        """Get all discounts of a specific type"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, product_id, discount_type, value, start_date, end_date
                FROM discounts 
                WHERE discount_type = $1
                ORDER BY start_date DESC
            """, discount_type)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_expiring_soon(cls, days: int = 7) -> List['Discount']:
        """Get discounts expiring within specified days"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, product_id, discount_type, value, start_date, end_date
                FROM discounts 
                WHERE end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '$1 days'
                ORDER BY end_date
            """, days)
            return [cls(**dict(row)) for row in rows]

    async def update(self, discount_type: str = None, value: float = None, 
                    start_date: date = None, end_date: date = None) -> 'Discount':
        """Update discount fields"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            updates = []
            values = []
            param_count = 1
            
            if discount_type is not None:
                updates.append(f"discount_type = ${param_count}")
                values.append(discount_type)
                param_count += 1
            if value is not None:
                updates.append(f"value = ${param_count}")
                values.append(value)
                param_count += 1
            if start_date is not None:
                updates.append(f"start_date = ${param_count}")
                values.append(start_date)
                param_count += 1
            if end_date is not None:
                updates.append(f"end_date = ${param_count}")
                values.append(end_date)
                param_count += 1

            if not updates:
                return self

            values.append(self.id)
            query = f"""
                UPDATE discounts 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, product_id, discount_type, value, start_date, end_date
            """
            
            row = await conn.fetchrow(query, *values)
            return Discount(**dict(row))

    async def delete(self) -> bool:
        """Delete discount"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM discounts WHERE id = $1", self.id)
            return result == "DELETE 1"

    def calculate_discount_amount(self, original_price: float) -> float:
        """Calculate discount amount based on original price"""
        if self.discount_type == DiscountTypeEnum.PERCENTAGE:
            return original_price * (self.value / 100)
        else:  # FIXED
            return min(self.value, original_price)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "product_id": self.product_id,
            "discount_type": self.discount_type,
            "value": float(self.value),
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None
        }
