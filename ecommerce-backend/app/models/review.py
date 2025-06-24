from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database import get_db_connection

class Review:
    def __init__(self, id: int, rating: int, comment: Optional[str], 
                 review_date: datetime, customer_id: int, product_id: int):
        self.id = id
        self.rating = rating
        self.comment = comment
        self.review_date = review_date
        self.customer_id = customer_id
        self.product_id = product_id

    @classmethod
    async def create_table(cls):
        """Create reviews table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS reviews (
                    id SERIAL PRIMARY KEY,
                    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                    comment TEXT,
                    review_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
                    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                    UNIQUE(customer_id, product_id)
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(review_date)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, customer_id: int, product_id: int, rating: int, 
                    comment: Optional[str] = None, review_date: Optional[datetime] = None) -> 'Review':
        """Create a new review"""
        if review_date is None:
            review_date = datetime.now()
            
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO reviews (customer_id, product_id, rating, comment, review_date)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, rating, comment, review_date, customer_id, product_id
            """, customer_id, product_id, rating, comment, review_date)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, review_id: int) -> Optional['Review']:
        """Get review by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, rating, comment, review_date, customer_id, product_id
                FROM reviews WHERE id = $1
            """, review_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_product_id(cls, product_id: int) -> List['Review']:
        """Get all reviews for a product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, rating, comment, review_date, customer_id, product_id
                FROM reviews 
                WHERE product_id = $1
                ORDER BY review_date DESC
            """, product_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_customer_id(cls, customer_id: int) -> List['Review']:
        """Get all reviews by a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, rating, comment, review_date, customer_id, product_id
                FROM reviews 
                WHERE customer_id = $1
                ORDER BY review_date DESC
            """, customer_id)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_rating(cls, rating: int) -> List['Review']:
        """Get all reviews with a specific rating"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, rating, comment, review_date, customer_id, product_id
                FROM reviews 
                WHERE rating = $1
                ORDER BY review_date DESC
            """, rating)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_customer_and_product(cls, customer_id: int, product_id: int) -> Optional['Review']:
        """Get review by customer for specific product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, rating, comment, review_date, customer_id, product_id
                FROM reviews 
                WHERE customer_id = $1 AND product_id = $2
            """, customer_id, product_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_product_average_rating(cls, product_id: int) -> float:
        """Get average rating for a product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.fetchval("""
                SELECT COALESCE(AVG(rating), 0)
                FROM reviews 
                WHERE product_id = $1
            """, product_id)
            return float(result) if result else 0.0

    @classmethod
    async def get_product_rating_count(cls, product_id: int) -> int:
        """Get number of reviews for a product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.fetchval("""
                SELECT COUNT(*)
                FROM reviews 
                WHERE product_id = $1
            """, product_id)
            return int(result) if result else 0

    @classmethod
    async def get_product_rating_distribution(cls, product_id: int) -> Dict[int, int]:
        """Get rating distribution for a product"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT rating, COUNT(*) as count
                FROM reviews 
                WHERE product_id = $1
                GROUP BY rating
                ORDER BY rating
            """, product_id)
            return {row['rating']: row['count'] for row in rows}

    async def update(self, rating: int = None, comment: str = None) -> 'Review':
        """Update review fields"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            updates = []
            values = []
            param_count = 1
            
            if rating is not None:
                updates.append(f"rating = ${param_count}")
                values.append(rating)
                param_count += 1
            if comment is not None:
                updates.append(f"comment = ${param_count}")
                values.append(comment)
                param_count += 1

            if not updates:
                return self

            values.append(self.id)
            query = f"""
                UPDATE reviews 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, rating, comment, review_date, customer_id, product_id
            """
            
            row = await conn.fetchrow(query, *values)
            return Review(**dict(row))

    async def delete(self) -> bool:
        """Delete review"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM reviews WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "rating": self.rating,
            "comment": self.comment,
            "review_date": self.review_date.isoformat() if self.review_date else None,
            "customer_id": self.customer_id,
            "product_id": self.product_id
        }
