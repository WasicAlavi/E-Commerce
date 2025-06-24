# app/models/payment_method.py

from typing import List, Optional, Dict, Any
from enum import Enum
from app.database import get_db_connection

class PaymentTypeEnum(str, Enum):
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PAYPAL = "paypal"
    UPI = "upi"

class PaymentMethod:
    def __init__(self, id: int, customer_id: int, account_no: str, 
                 is_default: bool = False, type: str = "credit_card"):
        self.id = id
        self.customer_id = customer_id
        self.account_no = account_no
        self.is_default = is_default
        self.type = type

    @classmethod
    async def create_table(cls):
        """Create payment_methods table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS payment_methods (
                    id SERIAL PRIMARY KEY,
                    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
                    account_no VARCHAR NOT NULL,
                    is_default BOOLEAN DEFAULT FALSE,
                    type VARCHAR(20) NOT NULL CHECK (type IN ('credit_card', 'debit_card', 'paypal', 'upi'))
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_payment_methods_customer ON payment_methods(customer_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(is_default)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, customer_id: int, account_no: str, type: str, 
                    is_default: bool = False) -> 'PaymentMethod':
        """Create a new payment method"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # If this is default, unset other default methods for this customer
            if is_default:
                await conn.execute("""
                    UPDATE payment_methods 
                    SET is_default = FALSE 
                    WHERE customer_id = $1
                """, customer_id)
            
            row = await conn.fetchrow("""
                INSERT INTO payment_methods (customer_id, account_no, type, is_default)
                VALUES ($1, $2, $3, $4)
                RETURNING id, customer_id, account_no, is_default, type
            """, customer_id, account_no, type, is_default)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, payment_id: int) -> Optional['PaymentMethod']:
        """Get payment method by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, customer_id, account_no, is_default, type
                FROM payment_methods WHERE id = $1
            """, payment_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_customer_id(cls, customer_id: int) -> List['PaymentMethod']:
        """Get all payment methods for a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, customer_id, account_no, is_default, type
                FROM payment_methods 
                WHERE customer_id = $1
                ORDER BY is_default DESC, id
            """, customer_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_default_by_customer(cls, customer_id: int) -> Optional['PaymentMethod']:
        """Get default payment method for a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, customer_id, account_no, is_default, type
                FROM payment_methods 
                WHERE customer_id = $1 AND is_default = TRUE
            """, customer_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_type(cls, type: str) -> List['PaymentMethod']:
        """Get all payment methods of a specific type"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, customer_id, account_no, is_default, type
                FROM payment_methods 
                WHERE type = $1
                ORDER BY id
            """, type)
            return [cls(**dict(row)) for row in rows]

    async def update(self, account_no: str = None, type: str = None, 
                    is_default: bool = None) -> 'PaymentMethod':
        """Update payment method fields"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            updates = []
            values = []
            param_count = 1
            
            if account_no is not None:
                updates.append(f"account_no = ${param_count}")
                values.append(account_no)
                param_count += 1
            if type is not None:
                updates.append(f"type = ${param_count}")
                values.append(type)
                param_count += 1
            if is_default is not None:
                updates.append(f"is_default = ${param_count}")
                values.append(is_default)
                param_count += 1

            if not updates:
                return self

            # If setting as default, unset other default methods for this customer
            if is_default:
                await conn.execute("""
                    UPDATE payment_methods 
                    SET is_default = FALSE 
                    WHERE customer_id = $1 AND id != $2
                """, self.customer_id, self.id)

            values.append(self.id)
            query = f"""
                UPDATE payment_methods 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, customer_id, account_no, is_default, type
            """
            
            row = await conn.fetchrow(query, *values)
            return PaymentMethod(**dict(row))

    async def set_as_default(self) -> 'PaymentMethod':
        """Set this payment method as default for the customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Unset other default methods for this customer
            await conn.execute("""
                UPDATE payment_methods 
                SET is_default = FALSE 
                WHERE customer_id = $1
            """, self.customer_id)
            
            # Set this method as default
            row = await conn.fetchrow("""
                UPDATE payment_methods 
                SET is_default = TRUE
                WHERE id = $1
                RETURNING id, customer_id, account_no, is_default, type
            """, self.id)
            return PaymentMethod(**dict(row))

    async def delete(self) -> bool:
        """Delete payment method"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM payment_methods WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "account_no": self.account_no,
            "is_default": self.is_default,
            "type": self.type
        }
