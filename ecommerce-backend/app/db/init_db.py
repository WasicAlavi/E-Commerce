"""
Database initialization script using raw SQL
"""

from app.database import get_database_pool
import asyncpg

async def init_database():
    """Initialize database tables"""
    pool = await get_database_pool()
    async with pool.acquire() as conn:
        # This will be handled by the models creating their own tables
        print("Database connection established successfully")
        return True