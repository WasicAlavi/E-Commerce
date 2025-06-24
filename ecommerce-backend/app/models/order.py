# app/models/order.py

from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database import get_db_connection

class Order:
    def __init__(self, id: int, customer_id: int, order_date: datetime, 
                 total_price: float, address_id: int, payment_id: Optional[int] = None):
        self.id = id
        self.customer_id = customer_id
        self.order_date = order_date
        self.total_price = total_price
        self.address_id = address_id
        self.payment_id = payment_id

    @classmethod
    async def create_table(cls):
        """Create orders table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS orders (
                    id SERIAL PRIMARY KEY,
                    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
                    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    total_price DECIMAL(10,2) NOT NULL,
                    address_id INTEGER NOT NULL REFERENCES addresses(id) ON DELETE CASCADE,
                    payment_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_id)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, customer_id: int, total_price: float, address_id: int, 
                    payment_id: Optional[int] = None, order_date: Optional[datetime] = None) -> 'Order':
        """Create a new order"""
        if order_date is None:
            order_date = datetime.now()
            
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO orders (customer_id, order_date, total_price, address_id, payment_id)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, customer_id, order_date, total_price, address_id, payment_id
            """, customer_id, order_date, total_price, address_id, payment_id)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, order_id: int) -> Optional['Order']:
        """Get order by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, customer_id, order_date, total_price, address_id, payment_id
                FROM orders WHERE id = $1
            """, order_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_customer_id(cls, customer_id: int) -> List['Order']:
        """Get all orders for a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, customer_id, order_date, total_price, address_id, payment_id
                FROM orders 
                WHERE customer_id = $1
                ORDER BY order_date DESC
            """, customer_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_all(cls) -> List['Order']:
        """Get all orders"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, customer_id, order_date, total_price, address_id, payment_id
                FROM orders 
                ORDER BY order_date DESC
            """)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_date_range(cls, start_date: datetime, end_date: datetime) -> List['Order']:
        """Get orders within date range"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, customer_id, order_date, total_price, address_id, payment_id
                FROM orders 
                WHERE order_date BETWEEN $1 AND $2
                ORDER BY order_date DESC
            """, start_date, end_date)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_payment_method(cls, payment_id: int) -> List['Order']:
        """Get orders by payment method"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, customer_id, order_date, total_price, address_id, payment_id
                FROM orders 
                WHERE payment_id = $1
                ORDER BY order_date DESC
            """, payment_id)
            return [cls(**dict(row)) for row in rows]

    async def update(self, total_price: float = None, address_id: int = None, 
                    payment_id: Optional[int] = None) -> 'Order':
        """Update order fields"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            updates = []
            values = []
            param_count = 1
            
            if total_price is not None:
                updates.append(f"total_price = ${param_count}")
                values.append(total_price)
                param_count += 1
            if address_id is not None:
                updates.append(f"address_id = ${param_count}")
                values.append(address_id)
                param_count += 1
            if payment_id is not None:
                updates.append(f"payment_id = ${param_count}")
                values.append(payment_id)
                param_count += 1

            if not updates:
                return self

            values.append(self.id)
            query = f"""
                UPDATE orders 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, customer_id, order_date, total_price, address_id, payment_id
            """
            
            row = await conn.fetchrow(query, *values)
            return Order(**dict(row))

    async def delete(self) -> bool:
        """Delete order"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM orders WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "order_date": self.order_date.isoformat() if self.order_date else None,
            "total_price": float(self.total_price),
            "address_id": self.address_id,
            "payment_id": self.payment_id
        }

