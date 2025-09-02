from typing import Optional, Dict, Any
from datetime import datetime
from app.database import get_db_connection

class ShippingInfo:
    def __init__(self, id: int, order_id: int, courier_service: str, tracking_id: str, 
                 estimated_delivery: Optional[str] = None, notes: Optional[str] = None,
                 created_at: datetime = None, updated_at: datetime = None):
        self.id = id
        self.order_id = order_id
        self.courier_service = courier_service
        self.tracking_id = tracking_id
        self.estimated_delivery = estimated_delivery
        self.notes = notes
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()

    @classmethod
    async def create_table(cls):
        """Create shipping_info table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS shipping_info (
                    id SERIAL PRIMARY KEY,
                    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                    courier_service VARCHAR(100) NOT NULL,
                    tracking_id VARCHAR(100) NOT NULL,
                    estimated_delivery VARCHAR(50),
                    notes TEXT,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(order_id)
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_shipping_order_id ON shipping_info(order_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_shipping_tracking_id ON shipping_info(tracking_id)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, order_id: int, courier_service: str, tracking_id: str, 
                    estimated_delivery: Optional[str] = None, notes: Optional[str] = None) -> 'ShippingInfo':
        """Create new shipping info"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO shipping_info (order_id, courier_service, tracking_id, estimated_delivery, notes)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, order_id, courier_service, tracking_id, estimated_delivery, notes, created_at, updated_at
            """, order_id, courier_service, tracking_id, estimated_delivery, notes)
            return cls(**dict(row))

    @classmethod
    async def get_by_order_id(cls, order_id: int) -> Optional['ShippingInfo']:
        """Get shipping info by order ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, order_id, courier_service, tracking_id, estimated_delivery, notes, created_at, updated_at
                FROM shipping_info WHERE order_id = $1
            """, order_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_id(cls, shipping_id: int) -> Optional['ShippingInfo']:
        """Get shipping info by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, order_id, courier_service, tracking_id, estimated_delivery, notes, created_at, updated_at
                FROM shipping_info WHERE id = $1
            """, shipping_id)
            return cls(**dict(row)) if row else None

    async def update(self, courier_service: Optional[str] = None, tracking_id: Optional[str] = None,
                    estimated_delivery: Optional[str] = None, notes: Optional[str] = None) -> 'ShippingInfo':
        """Update shipping info"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Build dynamic update query
            updates = []
            params = []
            param_count = 1

            if courier_service is not None:
                updates.append(f"courier_service = ${param_count}")
                params.append(courier_service)
                param_count += 1

            if tracking_id is not None:
                updates.append(f"tracking_id = ${param_count}")
                params.append(tracking_id)
                param_count += 1

            if estimated_delivery is not None:
                updates.append(f"estimated_delivery = ${param_count}")
                params.append(estimated_delivery)
                param_count += 1

            if notes is not None:
                updates.append(f"notes = ${param_count}")
                params.append(notes)
                param_count += 1

            if not updates:
                return self

            updates.append(f"updated_at = CURRENT_TIMESTAMP")
            params.append(self.id)

            query = f"""
                UPDATE shipping_info 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, order_id, courier_service, tracking_id, estimated_delivery, notes, created_at, updated_at
            """

            row = await conn.fetchrow(query, *params)
            return ShippingInfo(**dict(row))

    async def delete(self) -> bool:
        """Delete shipping info"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM shipping_info WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "order_id": self.order_id,
            "courier_service": self.courier_service,
            "tracking_id": self.tracking_id,
            "estimated_delivery": self.estimated_delivery,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        } 