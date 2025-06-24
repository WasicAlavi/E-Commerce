# app/models/order_item.py

from typing import List, Optional, Dict, Any
from app.database import get_db_connection

class OrderItem:
    def __init__(self, id: int, order_id: int, product_id: int, quantity: int, price: float):
        self.id = id
        self.order_id = order_id
        self.product_id = product_id
        self.quantity = quantity
        self.price = price

    @classmethod
    async def create_table(cls):
        """Create order_items table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS order_items (
                    id SERIAL PRIMARY KEY,
                    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                    quantity INTEGER NOT NULL,
                    price DECIMAL(10,2) NOT NULL
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, order_id: int, product_id: int, quantity: int, price: float) -> 'OrderItem':
        """Create a new order item"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES ($1, $2, $3, $4)
                RETURNING id, order_id, product_id, quantity, price
            """, order_id, product_id, quantity, price)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, item_id: int) -> Optional['OrderItem']:
        """Get order item by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, order_id, product_id, quantity, price
                FROM order_items WHERE id = $1
            """, item_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_order_id(cls, order_id: int) -> List['OrderItem']:
        """Get all items for an order"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, order_id, product_id, quantity, price
                FROM order_items 
                WHERE order_id = $1
                ORDER BY id
            """, order_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_product_id(cls, product_id: int) -> List['OrderItem']:
        """Get all order items for a product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, order_id, product_id, quantity, price
                FROM order_items 
                WHERE product_id = $1
                ORDER BY id
            """, product_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_order_total(cls, order_id: int) -> float:
        """Calculate total price for an order"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.fetchval("""
                SELECT COALESCE(SUM(quantity * price), 0)
                FROM order_items 
                WHERE order_id = $1
            """, order_id)
            return float(result) if result else 0.0

    async def update(self, quantity: int = None, price: float = None) -> 'OrderItem':
        """Update order item fields"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            updates = []
            values = []
            param_count = 1
            
            if quantity is not None:
                updates.append(f"quantity = ${param_count}")
                values.append(quantity)
                param_count += 1
            if price is not None:
                updates.append(f"price = ${param_count}")
                values.append(price)
                param_count += 1

            if not updates:
                return self

            values.append(self.id)
            query = f"""
                UPDATE order_items 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, order_id, product_id, quantity, price
            """
            
            row = await conn.fetchrow(query, *values)
            return OrderItem(**dict(row))

    async def delete(self) -> bool:
        """Delete order item"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM order_items WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "order_id": self.order_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "price": float(self.price)
        }
