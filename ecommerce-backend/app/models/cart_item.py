from typing import List, Optional, Dict, Any
from app.database import get_db_connection

class CartItem:
    def __init__(self, id: int, cart_id: int, product_id: int, quantity: int):
        self.id = id
        self.cart_id = cart_id
        self.product_id = product_id
        self.quantity = quantity

    @classmethod
    async def create_table(cls):
        """Create cart_items table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS cart_items (
                    id SERIAL PRIMARY KEY,
                    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
                    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                    quantity INTEGER NOT NULL DEFAULT 1,
                    UNIQUE(cart_id, product_id)
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, cart_id: int, product_id: int, quantity: int = 1) -> 'CartItem':
        """Create a new cart item"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Check if item already exists in cart
            existing = await conn.fetchrow("""
                SELECT id, cart_id, product_id, quantity
                FROM cart_items 
                WHERE cart_id = $1 AND product_id = $2
            """, cart_id, product_id)
            
            if existing:
                # Update quantity if item exists
                row = await conn.fetchrow("""
                    UPDATE cart_items 
                    SET quantity = quantity + $1
                    WHERE cart_id = $2 AND product_id = $3
                    RETURNING id, cart_id, product_id, quantity
                """, quantity, cart_id, product_id)
            else:
                # Create new item
                row = await conn.fetchrow("""
                    INSERT INTO cart_items (cart_id, product_id, quantity)
                    VALUES ($1, $2, $3)
                    RETURNING id, cart_id, product_id, quantity
                """, cart_id, product_id, quantity)
            
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, item_id: int, include_deleted: bool = False) -> Optional['CartItem']:
        """Get cart item by ID, excluding deleted by default"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            query = "SELECT id, cart_id, product_id, quantity FROM cart_items WHERE id = $1"
            params = [item_id]
            if not include_deleted:
                query += " AND is_deleted = FALSE"
            row = await conn.fetchrow(query, *params)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_cart_id(cls, cart_id: int, include_deleted: bool = False) -> List['CartItem']:
        """Get all items in a cart, excluding deleted by default"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            query = "SELECT id, cart_id, product_id, quantity FROM cart_items WHERE cart_id = $1"
            params = [cart_id]
            if not include_deleted:
                query += " AND is_deleted = FALSE"
            query += " ORDER BY id"
            rows = await conn.fetch(query, *params)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_cart_and_product(cls, cart_id: int, product_id: int) -> Optional['CartItem']:
        """Get specific item in cart"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, cart_id, product_id, quantity
                FROM cart_items 
                WHERE cart_id = $1 AND product_id = $2
            """, cart_id, product_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_cart_total_items(cls, cart_id: int) -> int:
        """Get total number of items in cart"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.fetchval("""
                SELECT COALESCE(SUM(quantity), 0)
                FROM cart_items 
                WHERE cart_id = $1
            """, cart_id)
            return int(result) if result else 0

    @classmethod
    async def get_cart_total_price(cls, cart_id: int) -> float:
        """Calculate total price for a cart"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.fetchval("""
                SELECT COALESCE(SUM(ci.quantity * p.price), 0)
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.cart_id = $1
            """, cart_id)
            return float(result) if result else 0.0

    @classmethod
    async def get_by_cart_id_with_products(cls, cart_id: int) -> List[Dict[str, Any]]:
        """Get all items in a cart with product details"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT 
                    ci.id, ci.cart_id, ci.product_id, ci.quantity,
                    p.name as product_name, p.price as product_price,
                    COALESCE(pi.image_url, 'https://via.placeholder.com/100x100?text=No+Image') as product_image
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                WHERE ci.cart_id = $1
                ORDER BY ci.id
            """, cart_id)
            return [dict(row) for row in rows]

    @classmethod
    async def get_with_product(cls, item_id: int) -> Optional[Dict[str, Any]]:
        """Get cart item with product details"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT 
                    ci.id, ci.cart_id, ci.product_id, ci.quantity,
                    p.name as product_name, p.price as product_price,
                    COALESCE(pi.image_url, 'https://via.placeholder.com/100x100?text=No+Image') as product_image
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                WHERE ci.id = $1
            """, item_id)
            return dict(row) if row else None

    async def update_quantity(self, quantity: int) -> 'CartItem':
        """Update item quantity"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            if quantity <= 0:
                # Delete item if quantity is 0 or negative
                await conn.execute("DELETE FROM cart_items WHERE id = $1", self.id)
                return None
            
            row = await conn.fetchrow("""
                UPDATE cart_items 
                SET quantity = $1
                WHERE id = $2
                RETURNING id, cart_id, product_id, quantity
            """, quantity, self.id)
            return CartItem(**dict(row)) if row else None

    async def increment_quantity(self, amount: int = 1) -> 'CartItem':
        """Increment item quantity"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE cart_items 
                SET quantity = quantity + $1
                WHERE id = $2
                RETURNING id, cart_id, product_id, quantity
            """, amount, self.id)
            return CartItem(**dict(row))

    async def decrement_quantity(self, amount: int = 1) -> Optional['CartItem']:
        """Decrement item quantity"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE cart_items 
                SET quantity = GREATEST(quantity - $1, 0)
                WHERE id = $2
                RETURNING id, cart_id, product_id, quantity
            """, amount, self.id)
            
            if row and row['quantity'] <= 0:
                # Delete item if quantity becomes 0
                await conn.execute("DELETE FROM cart_items WHERE id = $1", self.id)
                return None
            
            return CartItem(**dict(row)) if row else None

    async def delete(self) -> bool:
        """Soft delete cart item"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute(
                "UPDATE cart_items SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1",
                self.id
            )
            return result.startswith("UPDATE")

    @classmethod
    async def clear_cart(cls, cart_id: int) -> bool:
        """Soft delete all items from a cart"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute(
                "UPDATE cart_items SET is_deleted = TRUE, deleted_at = NOW() WHERE cart_id = $1",
                cart_id
            )
            return result.startswith("UPDATE")

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "cart_id": self.cart_id,
            "product_id": self.product_id,
            "quantity": self.quantity
        }
