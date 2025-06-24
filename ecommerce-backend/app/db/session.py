# app/db/session.py
"""
Database session management for async operations
"""

import asyncpg
from typing import AsyncGenerator
from app.database import get_database_pool

async def get_db_session() -> AsyncGenerator[asyncpg.Connection, None]:
    """Get database session for dependency injection"""
    pool = await get_database_pool()
    async with pool.acquire() as connection:
        yield connection

async def get_db_transaction() -> AsyncGenerator[asyncpg.transaction.Transaction, None]:
    """Get database transaction for dependency injection"""
    pool = await get_database_pool()
    async with pool.acquire() as connection:
        async with connection.transaction() as transaction:
            yield transaction
