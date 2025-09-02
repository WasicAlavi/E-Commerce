# app/models/customer.py

from typing import List, Optional, Dict, Any
from app.database import get_db_connection
from datetime import date

class Customer:
    def __init__(self, id: int, user_id: int, first_name: str = None, last_name: str = None, 
                 phone: str = None, date_of_birth: date = None, gender: str = None, created_at = None):
        self.id = id
        self.user_id = user_id
        self.first_name = first_name
        self.last_name = last_name
        self.phone = phone
        self.date_of_birth = date_of_birth
        self.gender = gender
        self.created_at = created_at

    @classmethod
    async def create_table(cls):
        """Create customers table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS customers (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                    first_name VARCHAR(100),
                    last_name VARCHAR(100),
                    phone VARCHAR(20),
                    date_of_birth DATE,
                    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(first_name, last_name)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, user_id: int, first_name: str = None, last_name: str = None,
                    phone: str = None, date_of_birth: date = None, gender: str = None) -> 'Customer':
        """Create a new customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO customers (user_id, first_name, last_name, phone, date_of_birth, gender)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, user_id, first_name, last_name, phone, date_of_birth, gender, created_at
            """, user_id, first_name, last_name, phone, date_of_birth, gender)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, customer_id: int) -> Optional['Customer']:
        """Get customer by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, user_id, first_name, last_name, phone, date_of_birth, gender, created_at
                FROM customers WHERE id = $1
            """, customer_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_user_id(cls, user_id: int) -> Optional['Customer']:
        """Get customer by user ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, user_id, first_name, last_name, phone, date_of_birth, gender, created_at
                FROM customers WHERE user_id = $1
            """, user_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_all(cls) -> List['Customer']:
        """Get all customers"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, user_id, first_name, last_name, phone, date_of_birth, gender, created_at
                FROM customers
            """)
            return [cls(**dict(row)) for row in rows]

    async def update(self, first_name: str = None, last_name: str = None,
                    phone: str = None, date_of_birth: date = None, gender: str = None) -> 'Customer':
        """Update customer fields"""
        print(f"Customer.update called with: first_name={first_name}, last_name={last_name}, phone={phone}, date_of_birth={date_of_birth}, gender={gender}")  # Debug log
        
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            updates = []
            values = []
            param_count = 1
            
            if first_name is not None:
                updates.append(f"first_name = ${param_count}")
                values.append(first_name)
                param_count += 1
            if last_name is not None:
                updates.append(f"last_name = ${param_count}")
                values.append(last_name)
                param_count += 1
            if phone is not None:
                updates.append(f"phone = ${param_count}")
                values.append(phone)
                param_count += 1
            if date_of_birth is not None:
                updates.append(f"date_of_birth = ${param_count}")
                values.append(date_of_birth)
                param_count += 1
            if gender is not None:
                updates.append(f"gender = ${param_count}")
                values.append(gender)
                param_count += 1

            print(f"Updates to apply: {updates}")  # Debug log
            print(f"Values: {values}")  # Debug log

            if not updates:
                return self

            values.append(self.id)
            query = f"""
                UPDATE customers 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, user_id, first_name, last_name, phone, date_of_birth, gender
            """
            
            print(f"SQL Query: {query}")  # Debug log
            
            row = await conn.fetchrow(query, *values)
            return Customer(**dict(row))

    async def delete(self) -> bool:
        """Delete customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM customers WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone": self.phone,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "gender": self.gender
        }

