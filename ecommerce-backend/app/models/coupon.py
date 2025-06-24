from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from app.database import get_db_connection

class DiscountTypeEnum(str, Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"

class Coupon:
    def __init__(self, id: int, code: str, discount_type: str, value: float, 
                 usage_limit: int, used: int, valid_from: datetime, valid_until: datetime):
        self.id = id
        self.code = code
        self.discount_type = discount_type
        self.value = value
        self.usage_limit = usage_limit
        self.used = used
        self.valid_from = valid_from
        self.valid_until = valid_until

    @classmethod
    async def create_table(cls):
        """Create coupons table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS coupons (
                    id SERIAL PRIMARY KEY,
                    code VARCHAR(50) UNIQUE NOT NULL,
                    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
                    value DECIMAL(10,2) NOT NULL CHECK (value > 0),
                    usage_limit INTEGER NOT NULL CHECK (usage_limit > 0),
                    used INTEGER NOT NULL DEFAULT 0 CHECK (used >= 0),
                    valid_from TIMESTAMP NOT NULL,
                    valid_until TIMESTAMP NOT NULL CHECK (valid_until > valid_from)
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_coupons_validity ON coupons(valid_from, valid_until)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_coupons_type ON coupons(discount_type)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, code: str, discount_type: str, value: float, usage_limit: int,
                    valid_from: datetime, valid_until: datetime) -> 'Coupon':
        """Create a new coupon"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO coupons (code, discount_type, value, usage_limit, valid_from, valid_until)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, code, discount_type, value, usage_limit, used, valid_from, valid_until
            """, code, discount_type, value, usage_limit, valid_from, valid_until)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, coupon_id: int) -> Optional['Coupon']:
        """Get coupon by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, code, discount_type, value, usage_limit, used, valid_from, valid_until
                FROM coupons WHERE id = $1
            """, coupon_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_code(cls, code: str) -> Optional['Coupon']:
        """Get coupon by code"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, code, discount_type, value, usage_limit, used, valid_from, valid_until
                FROM coupons WHERE code = $1
            """, code)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_valid_coupon(cls, code: str, current_time: Optional[datetime] = None) -> Optional['Coupon']:
        """Get valid coupon by code"""
        if current_time is None:
            current_time = datetime.now()
            
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, code, discount_type, value, usage_limit, used, valid_from, valid_until
                FROM coupons 
                WHERE code = $1 
                AND valid_from <= $2 
                AND valid_until >= $2
                AND used < usage_limit
            """, code, current_time)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_active_coupons(cls, current_time: Optional[datetime] = None) -> List['Coupon']:
        """Get all currently active coupons"""
        if current_time is None:
            current_time = datetime.now()
            
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, code, discount_type, value, usage_limit, used, valid_from, valid_until
                FROM coupons 
                WHERE valid_from <= $1 
                AND valid_until >= $1
                AND used < usage_limit
                ORDER BY valid_until
            """, current_time)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_expiring_soon(cls, days: int = 7) -> List['Coupon']:
        """Get coupons expiring within specified days"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, code, discount_type, value, usage_limit, used, valid_from, valid_until
                FROM coupons 
                WHERE valid_until BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '$1 days'
                ORDER BY valid_until
            """, days)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_type(cls, discount_type: str) -> List['Coupon']:
        """Get all coupons of a specific type"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, code, discount_type, value, usage_limit, used, valid_from, valid_until
                FROM coupons 
                WHERE discount_type = $1
                ORDER BY valid_from DESC
            """, discount_type)
            return [cls(**dict(row)) for row in rows]

    async def increment_usage(self) -> 'Coupon':
        """Increment usage count for this coupon"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE coupons 
                SET used = used + 1
                WHERE id = $1 AND used < usage_limit
                RETURNING id, code, discount_type, value, usage_limit, used, valid_from, valid_until
            """, self.id)
            return Coupon(**dict(row)) if row else self

    async def update(self, code: str = None, discount_type: str = None, value: float = None,
                    usage_limit: int = None, valid_from: datetime = None, 
                    valid_until: datetime = None) -> 'Coupon':
        """Update coupon fields"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            updates = []
            values = []
            param_count = 1
            
            if code is not None:
                updates.append(f"code = ${param_count}")
                values.append(code)
                param_count += 1
            if discount_type is not None:
                updates.append(f"discount_type = ${param_count}")
                values.append(discount_type)
                param_count += 1
            if value is not None:
                updates.append(f"value = ${param_count}")
                values.append(value)
                param_count += 1
            if usage_limit is not None:
                updates.append(f"usage_limit = ${param_count}")
                values.append(usage_limit)
                param_count += 1
            if valid_from is not None:
                updates.append(f"valid_from = ${param_count}")
                values.append(valid_from)
                param_count += 1
            if valid_until is not None:
                updates.append(f"valid_until = ${param_count}")
                values.append(valid_until)
                param_count += 1

            if not updates:
                return self

            values.append(self.id)
            query = f"""
                UPDATE coupons 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, code, discount_type, value, usage_limit, used, valid_from, valid_until
            """
            
            row = await conn.fetchrow(query, *values)
            return Coupon(**dict(row))

    async def delete(self) -> bool:
        """Delete coupon"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM coupons WHERE id = $1", self.id)
            return result == "DELETE 1"

    def is_valid(self, current_time: Optional[datetime] = None) -> bool:
        """Check if coupon is valid"""
        if current_time is None:
            current_time = datetime.now()
        return (self.valid_from <= current_time <= self.valid_until and 
                self.used < self.usage_limit)

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
            "code": self.code,
            "discount_type": self.discount_type,
            "value": float(self.value),
            "usage_limit": self.usage_limit,
            "used": self.used,
            "valid_from": self.valid_from.isoformat() if self.valid_from else None,
            "valid_until": self.valid_until.isoformat() if self.valid_until else None
        }
