# app/models/order_status.py

from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from app.database import get_db_connection

class StatusEnum(str, Enum):
    PENDING = "pending"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class OrderStatus:
    def __init__(self, id: int, order_id: int, admin_id: int, status: str, update_date: datetime):
        self.id = id
        self.order_id = order_id
        self.admin_id = admin_id
        self.status = status
        self.update_date = update_date

    @classmethod
    async def create_table(cls):
        """Create order_statuses table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS order_statuses (
                    id SERIAL PRIMARY KEY,
                    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                    admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
                    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
                    update_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_order_statuses_order ON order_statuses(order_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_order_statuses_admin ON order_statuses(admin_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_order_statuses_status ON order_statuses(status)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_order_statuses_date ON order_statuses(update_date)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, order_id: int, admin_id: int, status: str, 
                    update_date: Optional[datetime] = None) -> 'OrderStatus':
        """Create a new order status"""
        if update_date is None:
            update_date = datetime.now()
            
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO order_statuses (order_id, admin_id, status, update_date)
                VALUES ($1, $2, $3, $4)
                RETURNING id, order_id, admin_id, status, update_date
            """, order_id, admin_id, status, update_date)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, status_id: int) -> Optional['OrderStatus']:
        """Get order status by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, order_id, admin_id, status, update_date
                FROM order_statuses WHERE id = $1
            """, status_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_order_id(cls, order_id: int) -> List['OrderStatus']:
        """Get all status updates for an order"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, order_id, admin_id, status, update_date
                FROM order_statuses 
                WHERE order_id = $1
                ORDER BY update_date DESC
            """, order_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_latest_status(cls, order_id: int) -> Optional['OrderStatus']:
        """Get the latest status for an order"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, order_id, admin_id, status, update_date
                FROM order_statuses 
                WHERE order_id = $1
                ORDER BY update_date DESC
                LIMIT 1
            """, order_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_status(cls, status: str) -> List['OrderStatus']:
        """Get all orders with a specific status"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, order_id, admin_id, status, update_date
                FROM order_statuses 
                WHERE status = $1
                ORDER BY update_date DESC
            """, status)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_admin_id(cls, admin_id: int) -> List['OrderStatus']:
        """Get all status updates by an admin"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, order_id, admin_id, status, update_date
                FROM order_statuses 
                WHERE admin_id = $1
                ORDER BY update_date DESC
            """, admin_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_orders_by_status(cls, status: str) -> List[int]:
        """Get order IDs with a specific status"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT DISTINCT order_id
                FROM order_statuses 
                WHERE status = $1
                ORDER BY order_id
            """, status)
            return [row['order_id'] for row in rows]

    async def update(self, status: str = None, admin_id: int = None) -> 'OrderStatus':
        """Update order status fields"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            updates = []
            values = []
            param_count = 1
            
            if status is not None:
                updates.append(f"status = ${param_count}")
                values.append(status)
                param_count += 1
            if admin_id is not None:
                updates.append(f"admin_id = ${param_count}")
                values.append(admin_id)
                param_count += 1

            if not updates:
                return self

            # Always update the update_date
            updates.append(f"update_date = ${param_count}")
            values.append(datetime.now())
            param_count += 1

            values.append(self.id)
            query = f"""
                UPDATE order_statuses 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, order_id, admin_id, status, update_date
            """
            
            row = await conn.fetchrow(query, *values)
            return OrderStatus(**dict(row))

    async def delete(self) -> bool:
        """Delete order status"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM order_statuses WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "order_id": self.order_id,
            "admin_id": self.admin_id,
            "status": self.status,
            "update_date": self.update_date.isoformat() if self.update_date else None
        }
