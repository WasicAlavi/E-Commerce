from typing import List, Optional, Dict, Any
from app.database import get_db_connection

class User:
    def __init__(self, id: int, name: str, email: str, hashed_password: str, role: str = None):
        self.id = id
        self.name = name
        self.username = name  # Alias for compatibility
        self.email = email
        self.hashed_password = hashed_password
        self.role = role

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
                    role VARCHAR(20) DEFAULT 'user'
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
                INSERT INTO users (name, email, hashed_password)
                VALUES ($1, $2, $3)
                RETURNING id, name, email, hashed_password, role
            """, username, email, hashed_password)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, user_id: int) -> Optional['User']:
        """Get user by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, name, email, hashed_password, role
                FROM users WHERE id = $1
            """, user_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_username(cls, username: str) -> Optional['User']:
        """Get user by username/name"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, name, email, hashed_password, role
                FROM users WHERE name = $1
            """, username)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_email(cls, email: str) -> Optional['User']:
        """Get user by email"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, name, email, hashed_password, role
                FROM users WHERE email = $1
            """, email)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_all(cls) -> List['User']:
        """Get all users"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, name, email, hashed_password, role
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

    async def delete(self) -> bool:
        """Delete user"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM users WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "username": self.name,  # Alias for compatibility
            "name": self.name,
            "email": self.email,
            "role": self.role
        }
