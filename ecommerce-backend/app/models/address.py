from typing import List, Optional, Dict, Any
from app.database import get_db_connection

class Address:
    def __init__(self, id: int, customer_id: int, street: str, city: str, 
                 division: str, country: str, postal_code: str):
        self.id = id
        self.customer_id = customer_id
        self.street = street
        self.city = city
        self.division = division
        self.country = country
        self.postal_code = postal_code

    @classmethod
    async def create_table(cls):
        """Create addresses table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS addresses (
                    id SERIAL PRIMARY KEY,
                    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
                    street VARCHAR NOT NULL,
                    city VARCHAR NOT NULL,
                    division VARCHAR NOT NULL,
                    country VARCHAR NOT NULL,
                    postal_code VARCHAR NOT NULL
                )
            """)

    @classmethod
    async def create(cls, customer_id: int, street: str, city: str, 
                    division: str, country: str, postal_code: str) -> 'Address':
        """Create a new address"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO addresses (customer_id, street, city, division, country, postal_code)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, customer_id, street, city, division, country, postal_code
            """, customer_id, street, city, division, country, postal_code)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, address_id: int) -> Optional['Address']:
        """Get address by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, customer_id, street, city, division, country, postal_code
                FROM addresses WHERE id = $1
            """, address_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_customer_id(cls, customer_id: int) -> List['Address']:
        """Get all addresses for a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, customer_id, street, city, division, country, postal_code
                FROM addresses WHERE customer_id = $1
            """, customer_id)
            return [cls(**dict(row)) for row in rows]

    async def update(self, street: str = None, city: str = None, 
                    division: str = None, country: str = None, 
                    postal_code: str = None) -> 'Address':
        """Update address fields"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Build dynamic update query
            updates = []
            values = []
            param_count = 1
            
            if street is not None:
                updates.append(f"street = ${param_count}")
                values.append(street)
                param_count += 1
            if city is not None:
                updates.append(f"city = ${param_count}")
                values.append(city)
                param_count += 1
            if division is not None:
                updates.append(f"division = ${param_count}")
                values.append(division)
                param_count += 1
            if country is not None:
                updates.append(f"country = ${param_count}")
                values.append(country)
                param_count += 1
            if postal_code is not None:
                updates.append(f"postal_code = ${param_count}")
                values.append(postal_code)
                param_count += 1

            if not updates:
                return self

            values.append(self.id)
            query = f"""
                UPDATE addresses 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, customer_id, street, city, division, country, postal_code
            """
            
            row = await conn.fetchrow(query, *values)
            return Address(**dict(row))

    async def delete(self) -> bool:
        """Delete address"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM addresses WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "street": self.street,
            "city": self.city,
            "division": self.division,
            "country": self.country,
            "postal_code": self.postal_code
        }
