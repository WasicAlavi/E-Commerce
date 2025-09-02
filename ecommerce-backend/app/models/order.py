# app/models/order.py

from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database import get_db_connection
from app.utils.id_generator import id_generator

class Order:
    def __init__(self, id: int, customer_id: int, order_date: datetime, 
                 total_price: float, address_id: int, payment_id: Optional[int] = None, 
                 status: str = 'pending', secure_order_id: Optional[str] = None,
                 transaction_id: Optional[str] = None):
        self.id = id
        self.customer_id = customer_id
        self.order_date = order_date
        self.total_price = total_price
        self.address_id = address_id
        self.payment_id = payment_id
        self.status = status
        self.secure_order_id = secure_order_id or id_generator.generate_order_id()
        self.transaction_id = transaction_id

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
                    payment_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'shipped', 'delivered', 'cancelled')),
                    secure_order_id VARCHAR(50) UNIQUE NOT NULL,
                    transaction_id VARCHAR(100) UNIQUE
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_secure_id ON orders(secure_order_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_total_price ON orders(total_price)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_address ON orders(address_id)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, customer_id: int, total_price: float, address_id: int, 
                    payment_id: Optional[int] = None, order_date: Optional[datetime] = None, status: str = 'pending') -> 'Order':
        """Create a new order"""
        if order_date is None:
            order_date = datetime.now()
        
        # Generate secure order ID
        secure_order_id = id_generator.generate_order_id()
            
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO orders (customer_id, order_date, total_price, address_id, payment_id, status, secure_order_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, customer_id, order_date, total_price, address_id, payment_id, status, secure_order_id, transaction_id
            """, customer_id, order_date, total_price, address_id, payment_id, status, secure_order_id)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, order_id: int) -> Optional['Order']:
        """Get order by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, customer_id, order_date, total_price, address_id, payment_id, status, secure_order_id, transaction_id
                FROM orders WHERE id = $1
            """, order_id)
            return cls(**dict(row)) if row else None
    
    @classmethod
    async def get_by_secure_id(cls, secure_order_id: str) -> Optional['Order']:
        """Get order by secure order ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, customer_id, order_date, total_price, address_id, payment_id, status, secure_order_id, transaction_id
                FROM orders WHERE secure_order_id = $1
            """, secure_order_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_customer_id(cls, customer_id: int) -> List['Order']:
        """Get all orders for a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, customer_id, order_date, total_price, address_id, payment_id, status, secure_order_id, transaction_id
                FROM orders 
                WHERE customer_id = $1
                ORDER BY order_date DESC
            """, customer_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_all(cls, skip: int = 0, limit: int = 100) -> List['Order']:
        """Get all orders with pagination"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, customer_id, order_date, total_price, address_id, payment_id, status, secure_order_id, transaction_id
                FROM orders 
                ORDER BY order_date DESC
                LIMIT $1 OFFSET $2
            """, limit, skip)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_date_range(cls, start_date: datetime, end_date: datetime) -> List['Order']:
        """Get orders within date range"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, customer_id, order_date, total_price, address_id, payment_id, status, secure_order_id, transaction_id
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
                SELECT id, customer_id, order_date, total_price, address_id, payment_id, status, secure_order_id, transaction_id
                FROM orders 
                WHERE payment_id = $1
                ORDER BY order_date DESC
            """, payment_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_customer_id_with_details(cls, customer_id: int) -> List[Dict[str, Any]]:
        """Get all orders for a customer with details"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Get orders with basic info
            rows = await conn.fetch("""
                SELECT o.id, o.customer_id, o.order_date, o.total_price, o.address_id, o.payment_id, o.status, o.secure_order_id, o.transaction_id
                FROM orders o
                WHERE o.customer_id = $1
                ORDER BY o.order_date DESC
            """, customer_id)
            
            orders_with_details = []
            for row in rows:
                order_data = dict(row)
                
                # Convert order_date to string if it's a datetime
                if order_data.get('order_date') and isinstance(order_data['order_date'], datetime):
                    order_data['order_date'] = order_data['order_date'].isoformat()

                # Get order items
                items = await conn.fetch("""
                    SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price,
                           p.name as product_name,
                           COALESCE(pi.image_url, 'https://via.placeholder.com/100x100?text=No+Image') as product_image
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.id
                    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                    WHERE oi.order_id = $1
                """, order_data['id'])
                
                order_data['items'] = [dict(item) for item in items]
                
                # Get address details
                address = await conn.fetchrow("""
                    SELECT id, street, city, division, country, postal_code
                    FROM addresses
                    WHERE id = $1
                """, order_data['address_id'])
                
                order_data['address'] = dict(address) if address else None
                
                # Get payment method details
                if order_data['payment_id']:
                    payment = await conn.fetchrow("""
                        SELECT id, method_name
                        FROM payment_methods
                        WHERE id = $1
                    """, order_data['payment_id'])
                    order_data['payment_method'] = payment['method_name'] if payment else None
                else:
                    order_data['payment_method'] = None
                
                # Status is already included from the database query
                
                orders_with_details.append(order_data)
            
            return orders_with_details

    @classmethod
    async def get_by_id_with_details(cls, order_id: int) -> Optional[Dict[str, Any]]:
        """Get a single order by ID with all details"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Get order with basic info
            row = await conn.fetchrow("""
                SELECT o.id, o.customer_id, o.order_date, o.total_price, o.address_id, o.payment_id, o.status, o.secure_order_id, o.transaction_id
                FROM orders o
                WHERE o.id = $1
            """, order_id)
            
            if not row:
                return None
                
            order_data = dict(row)
            
            # Ensure total_price is a float
            order_data['total_price'] = float(order_data['total_price']) if order_data['total_price'] is not None else 0.0
            order_data['total_amount'] = order_data['total_price']  # Alias for frontend compatibility
            order_data['subtotal'] = order_data['total_price']  # Default to total_price, will be updated if we have items
            order_data['shipping_cost'] = 0.0  # Default shipping cost
            order_data['discount'] = 0.0  # Default discount
            
            # Get order items
            items = await conn.fetch("""
                SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price,
                       p.name as product_name,
                       COALESCE(pi.image_url, 'https://via.placeholder.com/100x100?text=No+Image') as product_image
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                WHERE oi.order_id = $1
            """, order_data['id'])
            
            # Convert items and ensure price is float
            order_data['order_items'] = []
            order_data['items'] = []  # Keep both for compatibility
            subtotal = 0.0
            
            for item in items:
                item_dict = dict(item)
                item_dict['price'] = float(item_dict['price']) if item_dict['price'] is not None else 0.0
                item_dict['quantity'] = int(item_dict['quantity']) if item_dict['quantity'] is not None else 0
                item_dict['total_price'] = item_dict['price'] * item_dict['quantity']
                subtotal += item_dict['total_price']
                
                # Add size and color fields for frontend compatibility
                item_dict['size'] = None
                item_dict['color'] = None
                
                order_data['order_items'].append(item_dict)
                order_data['items'].append(item_dict)
            
            # Update subtotal
            order_data['subtotal'] = subtotal
            
            # Get address details
            address = await conn.fetchrow("""
                SELECT id, street, city, division, country, postal_code
                FROM addresses
                WHERE id = $1
            """, order_data['address_id'])
            
            if address:
                address_dict = dict(address)
                # Map address fields to frontend expectations
                order_data['shipping_address'] = {
                    'id': address_dict['id'],
                    'full_name': f"Customer Address",  # Default name
                    'address_line1': address_dict['street'],
                    'address_line2': None,
                    'city': address_dict['city'],
                    'state': address_dict['division'],
                    'postal_code': address_dict['postal_code'],
                    'country': address_dict['country'],
                    'phone': None  # Will be filled from customer data if available
                }
                order_data['address'] = address_dict  # Keep original format for compatibility
            else:
                order_data['shipping_address'] = None
                order_data['address'] = None
            
            # Get customer details for shipping address
            customer = await conn.fetchrow("""
                SELECT c.first_name, c.last_name, c.phone
                FROM customers c
                WHERE c.id = $1
            """, order_data['customer_id'])
            
            if customer and order_data['shipping_address']:
                order_data['shipping_address']['full_name'] = f"{customer['first_name']} {customer['last_name']}"
                order_data['shipping_address']['phone'] = customer['phone']
            
            # Get payment method details
            if order_data['payment_id']:
                payment = await conn.fetchrow("""
                    SELECT id, method_name
                    FROM payment_methods
                    WHERE id = $1
                """, order_data['payment_id'])
                order_data['payment_method'] = payment['method_name'] if payment else None
            else:
                order_data['payment_method'] = None
            
            # Add created_at field for frontend compatibility
            order_data['created_at'] = order_data['order_date'].isoformat() if order_data['order_date'] else None
            
            # Status is already included from the database query
            
            return order_data

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
            "total_price": float(self.total_price) if self.total_price is not None else 0.0,
            "address_id": self.address_id,
            "payment_id": self.payment_id,
            "status": self.status,
            "secure_order_id": self.secure_order_id,
            "transaction_id": self.transaction_id
        }

    async def update_status(self, new_status: str) -> 'Order':
        """Update order status"""
        valid_statuses = ['pending', 'approved', 'shipped', 'delivered', 'cancelled']
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")
            
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE orders 
                SET status = $1
                WHERE id = $2
                RETURNING id, customer_id, order_date, total_price, address_id, payment_id, status, secure_order_id, transaction_id
            """, new_status, self.id)
            return Order(**dict(row))
    
    async def update_transaction_id(self, transaction_id: str) -> 'Order':
        """Update transaction ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE orders 
                SET transaction_id = $1
                WHERE id = $2
                RETURNING id, customer_id, order_date, total_price, address_id, payment_id, status, secure_order_id, transaction_id
            """, transaction_id, self.id)
            return Order(**dict(row))

