from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database import get_db_connection

class SearchHistory:
    def __init__(self, id: int, query: str, search_date: datetime, customer_id: int):
        self.id = id
        self.query = query
        self.search_date = search_date
        self.customer_id = customer_id

    @classmethod
    async def create_table(cls):
        """Create search_histories table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS search_histories (
                    id SERIAL PRIMARY KEY,
                    query VARCHAR(100) NOT NULL,
                    search_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_search_histories_customer ON search_histories(customer_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_search_histories_date ON search_histories(search_date)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_search_histories_query ON search_histories(query)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, customer_id: int, query: str, 
                    search_date: Optional[datetime] = None) -> 'SearchHistory':
        """Create a new search history entry"""
        if search_date is None:
            search_date = datetime.now()
            
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO search_histories (customer_id, query, search_date)
                VALUES ($1, $2, $3)
                RETURNING id, query, search_date, customer_id
            """, customer_id, query, search_date)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, history_id: int) -> Optional['SearchHistory']:
        """Get search history by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, query, search_date, customer_id
                FROM search_histories WHERE id = $1
            """, history_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_customer_id(cls, customer_id: int, limit: int = 50) -> List['SearchHistory']:
        """Get search history for a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, query, search_date, customer_id
                FROM search_histories 
                WHERE customer_id = $1
                ORDER BY search_date DESC
                LIMIT $2
            """, customer_id, limit)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_popular_searches(cls, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most popular search queries"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT query, COUNT(*) as search_count
                FROM search_histories 
                GROUP BY query
                ORDER BY search_count DESC
                LIMIT $1
            """, limit)
            return [dict(row) for row in rows]

    @classmethod
    async def get_recent_searches(cls, limit: int = 10) -> List['SearchHistory']:
        """Get most recent searches across all customers"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, query, search_date, customer_id
                FROM search_histories 
                ORDER BY search_date DESC
                LIMIT $1
            """, limit)
            return [cls(**dict(row)) for row in rows]

    @classmethod
    async def get_by_query(cls, query: str) -> List['SearchHistory']:
        """Get all search history entries for a specific query"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, query, search_date, customer_id
                FROM search_histories 
                WHERE query ILIKE $1
                ORDER BY search_date DESC
            """, f"%{query}%")
            return [cls(**dict(row)) for row in rows]

    async def delete(self) -> bool:
        """Delete search history entry"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM search_histories WHERE id = $1", self.id)
            return result == "DELETE 1"

    @classmethod
    async def clear_customer_history(cls, customer_id: int) -> bool:
        """Clear all search history for a customer"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM search_histories WHERE customer_id = $1", customer_id)
            return result != "DELETE 0"

    @classmethod
    async def get_search_suggestions(cls, partial_query: str, limit: int = 5) -> List[str]:
        """Get search suggestions based on partial query"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT DISTINCT query
                FROM search_histories 
                WHERE query ILIKE $1
                ORDER BY query
                LIMIT $2
            """, f"{partial_query}%", limit)
            return [row['query'] for row in rows]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "query": self.query,
            "search_date": self.search_date.isoformat() if self.search_date else None,
            "customer_id": self.customer_id
        }
