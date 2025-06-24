from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database import get_db_connection

class CouponRedeem:
    def __init__(self, id: int, coupon_id: int, customer_id: int, 
                 order_id: int, redeemed_at: datetime):
        self.id = id
        self.coupon_id = coupon_id
        self.customer_id = customer_id
        self.order_id = order_id
        self.redeemed_at = redeemed_at

    @classmethod
    async def create_table(cls):
        """Create coupon_redeems table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS coupon_redeems (
                    id SERIAL PRIMARY KEY,
                    coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
                    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
                    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                    redeemed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_coupon_redeems_coupon ON coupon_redeems(coupon_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_coupon_redeems_customer ON coupon_redeems(customer_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_coupon_redeems_order ON coupon_redeems(order_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_coupon_redeems_date ON coupon_redeems(redeemed_at)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, coupon_id: int, customer_id: int, order_id: int,
                    redeemed_at: Optional[datetime] = None) -> 'CouponRedeem':
        """Create a new coupon redeem record"""
        if redeemed_at is None:
            redeemed_at = datetime.now()
            
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO coupon_redeems (coupon_id, customer_id, order_id, redeemed_at)
                VALUES ($1, $2, $3, $4)
                RETURNING id, coupon_id, customer_id, order_id, redeemed_at
            """, coupon_id, customer_id, order_id, redeemed_at)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, redeem_id: int) -> Optional['CouponRedeem']:
        """Get coupon redeem by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, coupon_id, customer_id, order_id, redeemed_at
                FROM coupon_redeems WHERE id = $1
            """, redeem_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_coupon_id(cls, coupon_id: int) -> List['CouponRedeem']:
        """Get all redeems for a coupon"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, coupon_id, customer_id, order_id, redeemed_at
                FROM coupon_redeems 
                WHERE coupon_id = $1
                ORDER BY redeemed_at DESC
            """, coupon_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_customer_id(cls, customer_id: int) -> List['CouponRedeem']:
        """Get all coupon redeems by a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, coupon_id, customer_id, order_id, redeemed_at
                FROM coupon_redeems 
                WHERE customer_id = $1
                ORDER BY redeemed_at DESC
            """, customer_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_order_id(cls, order_id: int) -> Optional['CouponRedeem']:
        """Get coupon redeem for a specific order"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, coupon_id, customer_id, order_id, redeemed_at
                FROM coupon_redeems 
                WHERE order_id = $1
            """, order_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def check_customer_coupon_usage(cls, customer_id: int, coupon_id: int) -> bool:
        """Check if customer has already used this coupon"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.fetchval("""
                SELECT EXISTS(
                    SELECT 1 FROM coupon_redeems 
                    WHERE customer_id = $1 AND coupon_id = $2
                )
            """, customer_id, coupon_id)
            return bool(result)

    @classmethod
    async def get_coupon_usage_count(cls, coupon_id: int) -> int:
        """Get total usage count for a coupon"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.fetchval("""
                SELECT COUNT(*)
                FROM coupon_redeems 
                WHERE coupon_id = $1
            """, coupon_id)
            return int(result) if result else 0

    @classmethod
    async def get_customer_coupon_history(cls, customer_id: int) -> List[Dict[str, Any]]:
        """Get customer's coupon usage history with coupon details"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT 
                    cr.id as redeem_id,
                    cr.coupon_id,
                    cr.order_id,
                    cr.redeemed_at,
                    c.code as coupon_code,
                    c.discount_type,
                    c.value as discount_value
                FROM coupon_redeems cr
                JOIN coupons c ON cr.coupon_id = c.id
                WHERE cr.customer_id = $1
                ORDER BY cr.redeemed_at DESC
            """, customer_id)
            return [dict(row) for row in rows]

    async def delete(self) -> bool:
        """Delete coupon redeem record"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM coupon_redeems WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "coupon_id": self.coupon_id,
            "customer_id": self.customer_id,
            "order_id": self.order_id,
            "redeemed_at": self.redeemed_at.isoformat() if self.redeemed_at else None
        }
