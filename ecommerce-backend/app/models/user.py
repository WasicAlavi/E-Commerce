from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database import get_db_connection

class User:
    def __init__(self, id: int, name: str, email: str, hashed_password: str, role: str = None, 
                 login_count: int = 0, last_login: datetime = None, is_active: bool = True, 
                 created_at: datetime = None, updated_at: datetime = None):
        self.id = id
        self.name = name
        self.username = name  # Alias for compatibility
        self.email = email
        self.hashed_password = hashed_password
        self.role = role
        self.login_count = login_count
        self.last_login = last_login
        self.is_active = is_active
        self.created_at = created_at
        self.updated_at = updated_at
        print(f"DEBUG: User constructor - id: {id}, name: {name}, role: {role}, role type: {type(role)}")

    @classmethod
    async def create_table(cls):
        """Create users table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Create table first
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(50) NOT NULL UNIQUE,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    hashed_password VARCHAR NOT NULL,
                    role VARCHAR(20) DEFAULT 'user',
                    login_count INTEGER DEFAULT 0,
                    last_login TIMESTAMP,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # Create indexes after table exists
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_users_name ON users(name)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
            except Exception as e:
                # Indexes might already exist, ignore errors
                pass

    @classmethod
    async def create(cls, username: str, email: str, hashed_password: str) -> 'User':
        """Create a new user"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO users (name, email, hashed_password, role, login_count, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, 'user', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, name, email, hashed_password, role, login_count, last_login, is_active, created_at, updated_at
            """, username, email, hashed_password)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, user_id: int) -> Optional['User']:
        """Get user by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, name, email, hashed_password, role, login_count, last_login, is_active, created_at, updated_at
                FROM users WHERE id = $1
            """, user_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_username(cls, username: str) -> Optional['User']:
        """Get user by username/name"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, name, email, hashed_password, role, login_count, last_login, is_active, created_at, updated_at
                FROM users WHERE name = $1
            """, username)
            print(f"DEBUG: get_by_username - raw row: {dict(row) if row else None}")
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_email(cls, email: str) -> Optional['User']:
        """Get user by email"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, name, email, hashed_password, role, login_count, last_login, is_active, created_at, updated_at
                FROM users WHERE email = $1
            """, email)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_all(cls) -> List['User']:
        """Get all users"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, name, email, hashed_password, role, login_count, last_login, is_active, created_at, updated_at
                FROM users
            """)
            return [cls(**dict(row)) for row in rows]

    async def update(self, username: str = None, email: str = None, 
                    hashed_password: str = None) -> 'User':
        """Update user fields"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            updates = []
            values = []
            param_count = 1
            
            if username is not None:
                updates.append(f"name = ${param_count}")
                values.append(username)
                param_count += 1
            if email is not None:
                updates.append(f"email = ${param_count}")
                values.append(email)
                param_count += 1
            if hashed_password is not None:
                updates.append(f"hashed_password = ${param_count}")
                values.append(hashed_password)
                param_count += 1

            if not updates:
                return self

            values.append(self.id)
            query = f"""
                UPDATE users 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, name, email, hashed_password, role
            """
            
            row = await conn.fetchrow(query, *values)
            return User(**dict(row))

    async def update_role(self, role: str) -> 'User':
        """Update user role"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE users 
                SET role = $1
                WHERE id = $2
                RETURNING id, name, email, hashed_password, role
            """, role, self.id)
            return User(**dict(row))

    @classmethod
    async def fix_null_roles(cls) -> int:
        """Fix all users with null roles by setting them to 'user'"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("""
                UPDATE users 
                SET role = 'user' 
                WHERE role IS NULL
            """)
            # Extract the number of affected rows from the result
            if result.startswith("UPDATE"):
                try:
                    return int(result.split()[1])
                except (IndexError, ValueError):
                    return 0
            return 0

    async def delete(self) -> bool:
        """Delete user"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM users WHERE id = $1", self.id)
            return result == "DELETE 1"

    async def record_login(self) -> 'User':
        """Record a successful login"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE users 
                SET login_count = login_count + 1, 
                    last_login = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP,
                    is_active = true
                WHERE id = $1
                RETURNING id, name, email, hashed_password, role, login_count, last_login, is_active, created_at, updated_at
            """, self.id)
            return User(**dict(row)) if row else self

    async def update_activity_status(self, is_active: bool) -> 'User':
        """Update user activity status"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE users 
                SET is_active = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, name, email, hashed_password, role, login_count, last_login, is_active, created_at, updated_at
            """, is_active, self.id)
            return User(**dict(row)) if row else self

    @classmethod
    async def get_inactive_users(cls, days_threshold: int = 30) -> List['User']:
        """Get users who haven't logged in for specified days"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch(f"""
                SELECT id, name, email, hashed_password, role, login_count, last_login, is_active, created_at, updated_at
                FROM users 
                WHERE last_login < CURRENT_DATE - INTERVAL '{days_threshold} days' 
                   OR last_login IS NULL
                ORDER BY last_login ASC NULLS FIRST
            """)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_active_users(cls, days_threshold: int = 7) -> List['User']:
        """Get users who have logged in within specified days"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch(f"""
                SELECT id, name, email, hashed_password, role, login_count, last_login, is_active, created_at, updated_at
                FROM users 
                WHERE last_login >= CURRENT_DATE - INTERVAL '{days_threshold} days'
                ORDER BY last_login DESC
            """)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_user_activity_stats(cls) -> Dict[str, Any]:
        """Get user activity statistics"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            stats = await conn.fetchrow("""
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN last_login >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as active_users,
                    COUNT(CASE WHEN last_login < CURRENT_DATE - INTERVAL '30 days' OR last_login IS NULL THEN 1 END) as inactive_users,
                    COUNT(CASE WHEN last_login >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_logins,
                    COUNT(CASE WHEN last_login >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as monthly_logins,
                    AVG(login_count) as avg_login_count,
                    MAX(login_count) as max_login_count,
                    MIN(login_count) as min_login_count
                FROM users
            """)
            return dict(stats) if stats else {}

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "username": self.name,  # Alias for compatibility
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "login_count": self.login_count,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
