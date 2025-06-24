from typing import List, Optional, Dict, Any
from enum import Enum
from app.database import get_db_connection

class AdminRole(str, Enum):
    PRODUCT = "product"
    SALES = "sales"
    SUPERADMIN = "superadmin"

class Admin:
    def __init__(self, id: int, user_id: int, admin_role: str):
        self.id = id
        self.user_id = user_id
        self.admin_role = admin_role

    @classmethod
    async def create_table(cls):
        """Create admins table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS admins (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
                    admin_role VARCHAR(20) NOT NULL CHECK (admin_role IN ('product', 'sales', 'superadmin'))
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_admins_user ON admins(user_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(admin_role)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, user_id: int, admin_role: str) -> 'Admin':
        """Create a new admin"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO admins (user_id, admin_role)
                VALUES ($1, $2)
                RETURNING id, user_id, admin_role
            """, user_id, admin_role)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, admin_id: int) -> Optional['Admin']:
        """Get admin by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, user_id, admin_role
                FROM admins WHERE id = $1
            """, admin_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_user_id(cls, user_id: int) -> Optional['Admin']:
        """Get admin by user ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, user_id, admin_role
                FROM admins WHERE user_id = $1
            """, user_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_role(cls, admin_role: str) -> List['Admin']:
        """Get all admins with a specific role"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, user_id, admin_role
                FROM admins 
                WHERE admin_role = $1
                ORDER BY id
            """, admin_role)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_all_admins(cls) -> List['Admin']:
        """Get all admins"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, user_id, admin_role
                FROM admins 
                ORDER BY id
            """)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_admin_with_user_details(cls, admin_id: int) -> Optional[Dict[str, Any]]:
        """Get admin with user details"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT 
                    a.id as admin_id,
                    a.user_id,
                    a.admin_role,
                    u.username,
                    u.email,
                    u.first_name,
                    u.last_name
                FROM admins a
                JOIN users u ON a.user_id = u.id
                WHERE a.id = $1
            """, admin_id)
            return dict(row) if row else None

    @classmethod
    async def get_admins_with_user_details(cls) -> List[Dict[str, Any]]:
        """Get all admins with user details"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT 
                    a.id as admin_id,
                    a.user_id,
                    a.admin_role,
                    u.username,
                    u.email,
                    u.first_name,
                    u.last_name
                FROM admins a
                JOIN users u ON a.user_id = u.id
                ORDER BY a.id
            """)
            return [dict(row) for row in rows]

    @classmethod
    async def check_is_admin(cls, user_id: int) -> bool:
        """Check if user is an admin"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.fetchval("""
                SELECT EXISTS(
                    SELECT 1 FROM admins 
                    WHERE user_id = $1
                )
            """, user_id)
            return bool(result)

    @classmethod
    async def check_has_role(cls, user_id: int, admin_role: str) -> bool:
        """Check if user has specific admin role"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.fetchval("""
                SELECT EXISTS(
                    SELECT 1 FROM admins 
                    WHERE user_id = $1 AND admin_role = $2
                )
            """, user_id, admin_role)
            return bool(result)

    @classmethod
    async def check_is_superadmin(cls, user_id: int) -> bool:
        """Check if user is a superadmin"""
        return await cls.check_has_role(user_id, AdminRole.SUPERADMIN)

    async def update_role(self, admin_role: str) -> 'Admin':
        """Update admin role"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE admins 
                SET admin_role = $1
                WHERE id = $2
                RETURNING id, user_id, admin_role
            """, admin_role, self.id)
            return Admin(**dict(row))

    async def delete(self) -> bool:
        """Delete admin"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM admins WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "admin_role": self.admin_role
        }
