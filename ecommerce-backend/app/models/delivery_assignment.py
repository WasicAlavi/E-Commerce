from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database import get_db_connection
from app.utils.id_generator import id_generator

class DeliveryAssignment:
    def __init__(self, id: int, order_id: int, rider_id: int, assigned_at: datetime,
                 status: str, accepted_at: datetime = None, rejected_at: datetime = None,
                 rejection_reason: str = None, estimated_delivery: datetime = None, 
                 actual_delivery: datetime = None, delivery_notes: str = None, 
                 created_at: datetime = None, updated_at: datetime = None,
                 secure_assignment_id: str = None):
        self.id = id
        self.order_id = order_id
        self.rider_id = rider_id
        self.assigned_at = assigned_at
        self.status = status
        self.accepted_at = accepted_at
        self.rejected_at = rejected_at
        self.rejection_reason = rejection_reason
        self.estimated_delivery = estimated_delivery
        self.actual_delivery = actual_delivery
        self.delivery_notes = delivery_notes
        self.created_at = created_at
        self.updated_at = updated_at
        self.secure_assignment_id = secure_assignment_id or id_generator.generate_delivery_assignment_id()

    @classmethod
    async def create_table(cls):
        """Create delivery_assignments table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS delivery_assignments (
                    id SERIAL PRIMARY KEY,
                    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                    rider_id INTEGER NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
                    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
                        CHECK (status IN ('pending', 'accepted', 'rejected', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
                    accepted_at TIMESTAMP,
                    rejected_at TIMESTAMP,
                    rejection_reason TEXT,
                    estimated_delivery TIMESTAMP,
                    actual_delivery TIMESTAMP,
                    delivery_notes TEXT,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    secure_assignment_id VARCHAR(50) UNIQUE NOT NULL
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_delivery_assignments_order ON delivery_assignments(order_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_delivery_assignments_rider ON delivery_assignments(rider_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_delivery_assignments_status ON delivery_assignments(status)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_delivery_assignments_date ON delivery_assignments(assigned_at)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_delivery_assignments_secure_id ON delivery_assignments(secure_assignment_id)")
            except Exception as e:
                pass

    @classmethod
    def calculate_estimated_delivery(cls, assigned_at: datetime = None) -> datetime:
        """Calculate estimated delivery time (2-4 hours from assignment)"""
        from datetime import timedelta
        import random
        
        if assigned_at is None:
            assigned_at = datetime.now()
        
        # Random delivery time between 2-4 hours
        delivery_hours = random.uniform(2.0, 4.0)
        estimated_delivery = assigned_at + timedelta(hours=delivery_hours)
        
        return estimated_delivery

    @classmethod
    async def create(cls, order_id: int, rider_id: int, estimated_delivery: datetime = None,
                    delivery_notes: str = None) -> 'DeliveryAssignment':
        """Create a new delivery assignment"""
        # Generate secure assignment ID
        secure_assignment_id = id_generator.generate_delivery_assignment_id()
        
        # If no estimated delivery provided, calculate it automatically
        if estimated_delivery is None:
            estimated_delivery = cls.calculate_estimated_delivery()
        
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO delivery_assignments (order_id, rider_id, estimated_delivery, delivery_notes, secure_assignment_id)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, order_id, rider_id, assigned_at, status, accepted_at, rejected_at,
                         rejection_reason, estimated_delivery, actual_delivery, delivery_notes, 
                         created_at, updated_at, secure_assignment_id
            """, order_id, rider_id, estimated_delivery, delivery_notes, secure_assignment_id)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, assignment_id: int) -> Optional['DeliveryAssignment']:
        """Get delivery assignment by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, order_id, rider_id, assigned_at, status, accepted_at, rejected_at,
                       rejection_reason, estimated_delivery, actual_delivery, delivery_notes, 
                       created_at, updated_at, secure_assignment_id
                FROM delivery_assignments WHERE id = $1
            """, assignment_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_order_id(cls, order_id: int) -> Optional['DeliveryAssignment']:
        """Get delivery assignment by order ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, order_id, rider_id, assigned_at, status, accepted_at, rejected_at,
                       rejection_reason, estimated_delivery, actual_delivery, delivery_notes, 
                       created_at, updated_at, secure_assignment_id
                FROM delivery_assignments WHERE order_id = $1
            """, order_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_rider_id(cls, rider_id: int) -> List['DeliveryAssignment']:
        """Get all delivery assignments for a rider"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, order_id, rider_id, assigned_at, status, accepted_at, rejected_at,
                       rejection_reason, estimated_delivery, actual_delivery, delivery_notes, 
                       created_at, updated_at, secure_assignment_id
                FROM delivery_assignments 
                WHERE rider_id = $1
                ORDER BY assigned_at DESC
            """, rider_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_active_assignments(cls) -> List['DeliveryAssignment']:
        """Get all active delivery assignments"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, order_id, rider_id, assigned_at, status, accepted_at, rejected_at,
                       rejection_reason, estimated_delivery, actual_delivery, delivery_notes, 
                       created_at, updated_at, secure_assignment_id
                FROM delivery_assignments 
                WHERE status IN ('accepted', 'picked_up', 'in_transit')
                ORDER BY assigned_at ASC
            """)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_all(cls, skip: int = 0, limit: int = 100) -> List['DeliveryAssignment']:
        """Get all delivery assignments with pagination"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, order_id, rider_id, assigned_at, status, accepted_at, rejected_at,
                       rejection_reason, estimated_delivery, actual_delivery, delivery_notes, 
                       created_at, updated_at, secure_assignment_id
                FROM delivery_assignments 
                ORDER BY assigned_at DESC
                LIMIT $1 OFFSET $2
            """, limit, skip)
            return [cls(**dict(row)) for row in rows]

    async def update_status(self, status: str, delivery_notes: str = None) -> 'DeliveryAssignment':
        """Update delivery status"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            updates = [f"status = $2", f"updated_at = CURRENT_TIMESTAMP"]
            values = [self.id, status]
            param_count = 3
            
            if delivery_notes is not None:
                updates.append(f"delivery_notes = ${param_count}")
                values.append(delivery_notes)
                param_count += 1
            
            if status == 'delivered':
                updates.append(f"actual_delivery = CURRENT_TIMESTAMP")
            
            query = f"""
                UPDATE delivery_assignments 
                SET {', '.join(updates)}
                WHERE id = $1
                RETURNING id, order_id, rider_id, assigned_at, status, accepted_at, rejected_at,
                         rejection_reason, estimated_delivery, actual_delivery, delivery_notes, 
                         created_at, updated_at, secure_assignment_id
            """
            
            row = await conn.fetchrow(query, *values)
            return DeliveryAssignment(**dict(row))

    async def update_estimated_delivery(self, estimated_delivery: datetime) -> 'DeliveryAssignment':
        """Update estimated delivery time"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE delivery_assignments 
                SET estimated_delivery = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, order_id, rider_id, assigned_at, status, accepted_at, rejected_at,
                         rejection_reason, estimated_delivery, actual_delivery, delivery_notes, 
                         created_at, updated_at, secure_assignment_id
            """, self.id, estimated_delivery)
            return DeliveryAssignment(**dict(row))

    async def cancel(self, delivery_notes: str = None) -> 'DeliveryAssignment':
        """Cancel delivery assignment"""
        return await self.update_status('cancelled', delivery_notes)

    async def mark_picked_up(self, delivery_notes: str = None) -> 'DeliveryAssignment':
        """Mark order as picked up"""
        return await self.update_status('picked_up', delivery_notes)

    async def mark_in_transit(self, delivery_notes: str = None) -> 'DeliveryAssignment':
        """Mark order as in transit"""
        return await self.update_status('in_transit', delivery_notes)

    async def mark_delivered(self, delivery_notes: str = None) -> 'DeliveryAssignment':
        """Mark order as delivered"""
        return await self.update_status('delivered', delivery_notes)

    async def accept_delivery(self, estimated_delivery: datetime = None) -> 'DeliveryAssignment':
        """Accept a delivery assignment"""
        # If no estimated delivery provided, calculate it automatically
        if estimated_delivery is None:
            estimated_delivery = self.calculate_estimated_delivery(self.assigned_at)
        
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE delivery_assignments 
                SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP, 
                    estimated_delivery = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, order_id, rider_id, assigned_at, status, accepted_at, rejected_at,
                         rejection_reason, estimated_delivery, actual_delivery, delivery_notes, 
                         created_at, updated_at, secure_assignment_id
            """, self.id, estimated_delivery)
            if row:
                return DeliveryAssignment(**dict(row))
            return None

    async def reject_delivery(self, rejection_reason: str = None) -> 'DeliveryAssignment':
        """Reject a delivery assignment"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE delivery_assignments 
                SET status = 'rejected', rejected_at = CURRENT_TIMESTAMP, 
                    rejection_reason = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, order_id, rider_id, assigned_at, status, accepted_at, rejected_at,
                         rejection_reason, estimated_delivery, actual_delivery, delivery_notes, 
                         created_at, updated_at, secure_assignment_id
            """, self.id, rejection_reason)
            if row:
                return DeliveryAssignment(**dict(row))
            return None

    async def delete(self) -> bool:
        """Delete delivery assignment"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM delivery_assignments WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "order_id": self.order_id,
            "rider_id": self.rider_id,
            "assigned_at": self.assigned_at.isoformat() if self.assigned_at else None,
            "status": self.status,
            "accepted_at": self.accepted_at.isoformat() if self.accepted_at else None,
            "rejected_at": self.rejected_at.isoformat() if self.rejected_at else None,
            "rejection_reason": self.rejection_reason,
            "estimated_delivery": self.estimated_delivery.isoformat() if self.estimated_delivery else None,
            "actual_delivery": self.actual_delivery.isoformat() if self.actual_delivery else None,
            "delivery_notes": self.delivery_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "secure_assignment_id": self.secure_assignment_id
        } 