from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database import get_db_connection

class Cart:
    def __init__(self, id: int, customer_id: int, creation_date: datetime, 
                 is_active: bool = True, is_deleted: bool = False, deleted_at: datetime = None):
        self.id = id
        self.customer_id = customer_id
        self.creation_date = creation_date
        self.is_active = is_active
        self.is_deleted = is_deleted
        self.deleted_at = deleted_at

    @classmethod
    async def create_table(cls):
        """Create carts table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS carts (
                    id SERIAL PRIMARY KEY,
                    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
                    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    is_deleted BOOLEAN DEFAULT FALSE
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_carts_customer ON carts(customer_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_carts_active ON carts(is_active)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_carts_deleted ON carts(is_deleted)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, customer_id: int, creation_date: Optional[datetime] = None) -> 'Cart':
        """Create a new cart"""
        if creation_date is None:
            creation_date = datetime.now()
            
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO carts (customer_id, creation_date)
                VALUES ($1, $2)
                RETURNING id, customer_id, creation_date, is_active, is_deleted
            """, customer_id, creation_date)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, cart_id: int) -> Optional['Cart']:
        """Get cart by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, customer_id, creation_date, is_active, is_deleted
                FROM carts WHERE id = $1
            """, cart_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_active_cart_by_customer(cls, customer_id: int) -> Optional['Cart']:
        """Get active cart for a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, customer_id, creation_date, is_active, is_deleted
                FROM carts 
                WHERE customer_id = $1 AND is_active = TRUE AND is_deleted = FALSE
                ORDER BY creation_date DESC
                LIMIT 1
            """, customer_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_all_carts_by_customer(cls, customer_id: int) -> List['Cart']:
        """Get all carts for a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, customer_id, creation_date, is_active, is_deleted
                FROM carts 
                WHERE customer_id = $1
                ORDER BY creation_date DESC
            """, customer_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_active_carts(cls) -> List['Cart']:
        """Get all active carts"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, customer_id, creation_date, is_active, is_deleted
                FROM carts 
                WHERE is_active = TRUE AND is_deleted = FALSE
                ORDER BY creation_date DESC
            """)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_all(cls, skip: int = 0, limit: int = 100) -> List['Cart']:
        """Get all carts with pagination"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, customer_id, creation_date, is_active, is_deleted
                FROM carts 
                ORDER BY creation_date DESC
                LIMIT $1 OFFSET $2
            """, limit, skip)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_customer_id(cls, customer_id: int, include_deleted: bool = False) -> Optional['Cart']:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            query = "SELECT * FROM carts WHERE customer_id = $1 AND is_active = TRUE"
            params = [customer_id]
            if not include_deleted:
                query += " AND is_deleted = FALSE"
            query += " LIMIT 1"
            row = await conn.fetchrow(query, *params)
            return cls(**dict(row)) if row else None

    async def deactivate(self) -> 'Cart':
        """Deactivate cart"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE carts 
                SET is_active = FALSE
                WHERE id = $1
                RETURNING id, customer_id, creation_date, is_active, is_deleted
            """, self.id)
            return Cart(**dict(row))

    async def mark_as_deleted(self) -> 'Cart':
        """Mark cart as deleted"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE carts 
                SET is_deleted = TRUE, is_active = FALSE
                WHERE id = $1
                RETURNING id, customer_id, creation_date, is_active, is_deleted
            """, self.id)
            return Cart(**dict(row))

    async def reactivate(self) -> 'Cart':
        """Reactivate cart"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE carts 
                SET is_active = TRUE, is_deleted = FALSE
                WHERE id = $1
                RETURNING id, customer_id, creation_date, is_active, is_deleted
            """, self.id)
            return Cart(**dict(row))

    async def delete(self) -> bool:
        """Delete cart permanently"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM carts WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "creation_date": self.creation_date.isoformat() if self.creation_date else None,
            "is_active": self.is_active,
            "is_deleted": self.is_deleted,
            "items": []  # Will be populated by get_with_items method
        }

    async def get_with_items(self) -> Dict[str, Any]:
        """Get cart with items"""
        from app.models.cart_item import CartItem
        
        cart_dict = self.to_dict()
        items = await CartItem.get_by_cart_id(self.id)
        cart_dict["items"] = [item.to_dict() for item in items]
        return cart_dict

    async def clear_items(self) -> bool:
        """Clear all items from cart"""
        from app.models.cart_item import CartItem
        
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            try:
                await conn.execute("DELETE FROM cart_items WHERE cart_id = $1", self.id)
                return True
            except Exception as e:
                print(f"Error clearing cart items: {e}")
                return False

    @classmethod
    async def get_total(cls, cart_id: int) -> float:
        """Get total price for a cart"""
        from app.models.cart_item import CartItem
        return await CartItem.get_cart_total_price(cart_id)

    @classmethod
    async def get_with_details(cls, cart_id: int) -> Optional[Dict[str, Any]]:
        """Get cart with customer and item details"""
        cart = await cls.get_by_id(cart_id)
        if not cart:
            return None
        
        cart_dict = cart.to_dict()
        
        # Get customer details
        from app.models.customer import Customer
        customer = await Customer.get_by_id(cart.customer_id)
        if customer:
            cart_dict["customer"] = customer.to_dict()
        
        # Get items with product details
        from app.models.cart_item import CartItem
        items = await CartItem.get_by_cart_id_with_products(cart_id)
        cart_dict["items"] = items
        
        # Get total
        cart_dict["total_price"] = await cls.get_total(cart_id)
        cart_dict["total_items"] = await CartItem.get_cart_total_items(cart_id)
        
        return cart_dict
