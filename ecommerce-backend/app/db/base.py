"""
Base configuration for database operations using raw SQL with asyncpg
"""

from app.database import get_database_pool
import asyncpg
from typing import Optional

async def get_db_pool() -> asyncpg.Pool:
    """Get database connection pool"""
    return await get_database_pool()

async def execute_query(query: str, *args) -> Optional[asyncpg.Record]:
    """Execute a single query and return the result"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        return await conn.fetchrow(query, *args)

async def execute_many(query: str, *args) -> list[asyncpg.Record]:
    """Execute a query and return multiple results"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        return await conn.fetch(query, *args)

async def execute_transaction(queries: list[tuple[str, tuple]]) -> bool:
    """Execute multiple queries in a transaction"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            for query, args in queries:
                await conn.execute(query, *args)
    return True