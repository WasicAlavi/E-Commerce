from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database import get_db_connection

class Rider:
    def __init__(self, id: int, user_id: int, customer_id: int, is_active: bool, 
                 vehicle_type: str, vehicle_number: str, delivery_zones: List[str],
                 total_deliveries: int, created_at: datetime, updated_at: datetime):
        self.id = id
        self.user_id = user_id
        self.customer_id = customer_id
        self.is_active = is_active
        self.vehicle_type = vehicle_type
        self.vehicle_number = vehicle_number
        self.delivery_zones = delivery_zones

        self.total_deliveries = total_deliveries
        self.created_at = created_at
        self.updated_at = updated_at

    @classmethod
    async def create_table(cls):
        """Create riders table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS riders (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
                    is_active BOOLEAN NOT NULL DEFAULT true,
                    vehicle_type VARCHAR(50) NOT NULL,
                    vehicle_number VARCHAR(20),
                    delivery_zones TEXT[] NOT NULL DEFAULT '{}',

                    total_deliveries INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_riders_user_id ON riders(user_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_riders_customer_id ON riders(customer_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_riders_active ON riders(is_active)")

                await conn.execute("CREATE INDEX IF NOT EXISTS idx_riders_zones ON riders USING GIN(delivery_zones)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, user_id: int, customer_id: int, vehicle_type: str, 
                    vehicle_number: str = None, delivery_zones: List[str] = None) -> 'Rider':
        """Create a new rider"""
        if delivery_zones is None:
            delivery_zones = []
            
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO riders (user_id, customer_id, vehicle_type, vehicle_number, delivery_zones)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, user_id, customer_id, is_active, vehicle_type, vehicle_number, 
                         delivery_zones, total_deliveries, created_at, updated_at
            """, user_id, customer_id, vehicle_type, vehicle_number, delivery_zones)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, rider_id: int) -> Optional['Rider']:
        """Get rider by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, user_id, customer_id, is_active, vehicle_type, vehicle_number,
                       delivery_zones, total_deliveries, created_at, updated_at
                FROM riders WHERE id = $1
            """, rider_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_user_id(cls, user_id: int) -> Optional['Rider']:
        """Get rider by user ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, user_id, customer_id, is_active, vehicle_type, vehicle_number,
                       delivery_zones, total_deliveries, created_at, updated_at
                FROM riders WHERE user_id = $1
            """, user_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_customer_id(cls, customer_id: int) -> Optional['Rider']:
        """Get rider by customer ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, user_id, customer_id, is_active, vehicle_type, vehicle_number,
                       delivery_zones, total_deliveries, created_at, updated_at
                FROM riders WHERE customer_id = $1
            """, customer_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_active_riders(cls) -> List['Rider']:
        """Get all active riders"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, user_id, customer_id, is_active, vehicle_type, vehicle_number,
                       delivery_zones, total_deliveries, created_at, updated_at
                FROM riders 
                WHERE is_active = true
                ORDER BY total_deliveries DESC
            """)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_riders_by_zone(cls, zone: str) -> List['Rider']:
        """Get riders available for a specific delivery zone"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, user_id, customer_id, is_active, vehicle_type, vehicle_number,
                       delivery_zones, total_deliveries, created_at, updated_at
                FROM riders 
                WHERE is_active = true 
                AND $1 = ANY(delivery_zones)
                ORDER BY total_deliveries DESC
            """, zone)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_all(cls, skip: int = 0, limit: int = 100) -> List['Rider']:
        """Get all riders with pagination"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, user_id, customer_id, is_active, vehicle_type, vehicle_number,
                       delivery_zones, total_deliveries, created_at, updated_at
                FROM riders 
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
            """, limit, skip)
            return [cls(**dict(row)) for row in rows]

    async def update(self, vehicle_type: str = None, vehicle_number: str = None,
                    delivery_zones: List[str] = None, is_active: bool = None) -> 'Rider':
        """Update rider information"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            updates = []
            values = []
            param_count = 1
            
            if vehicle_type is not None:
                updates.append(f"vehicle_type = ${param_count}")
                values.append(vehicle_type)
                param_count += 1
            if vehicle_number is not None:
                updates.append(f"vehicle_number = ${param_count}")
                values.append(vehicle_number)
                param_count += 1
            if delivery_zones is not None:
                updates.append(f"delivery_zones = ${param_count}")
                values.append(delivery_zones)
                param_count += 1
            if is_active is not None:
                updates.append(f"is_active = ${param_count}")
                values.append(is_active)
                param_count += 1

            if not updates:
                return self

            updates.append(f"updated_at = CURRENT_TIMESTAMP")
            values.append(self.id)
            
            query = f"""
                UPDATE riders 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, user_id, customer_id, is_active, vehicle_type, vehicle_number,
                         delivery_zones, total_deliveries, created_at, updated_at
            """
            
            row = await conn.fetchrow(query, *values)
            return Rider(**dict(row))

    async def increment_deliveries(self) -> 'Rider':
        """Increment total deliveries count"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE riders 
                SET total_deliveries = total_deliveries + 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, user_id, customer_id, is_active, vehicle_type, vehicle_number,
                         delivery_zones, total_deliveries, created_at, updated_at
            """, self.id)
            return Rider(**dict(row))



    async def delete(self) -> bool:
        """Delete rider"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM riders WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "customer_id": self.customer_id,
            "is_active": self.is_active,
            "vehicle_type": self.vehicle_type,
            "vehicle_number": self.vehicle_number,
            "delivery_zones": self.delivery_zones,
            "total_deliveries": self.total_deliveries,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        } 