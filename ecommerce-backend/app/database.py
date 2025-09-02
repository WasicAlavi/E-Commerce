import asyncpg
from typing import Optional
from app.config import settings

DATABASE_URL = settings.DATABASE_URL

# Global connection pool
pool: Optional[asyncpg.Pool] = None

async def get_database_pool() -> asyncpg.Pool:
    """Get or create database connection pool"""
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=1,
            max_size=10
        )
    return pool

async def close_database_pool():
    """Close database connection pool"""
    global pool
    if pool:
        await pool.close()
        pool = None

async def get_db_connection():
    """Get database connection from pool"""
    pool = await get_database_pool()
    return pool
