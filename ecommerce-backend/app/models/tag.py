from typing import List, Optional, Dict, Any
from app.database import get_db_connection

class Tag:
    def __init__(self, id: int, tag_name: str, parent_id: Optional[int] = None):
        self.id = id
        self.tag_name = tag_name
        self.parent_id = parent_id

    @classmethod
    async def create_table(cls):
        """Create tags table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS tags (
                    id SERIAL PRIMARY KEY,
                    tag_name VARCHAR(50) NOT NULL UNIQUE,
                    parent_id INTEGER REFERENCES tags(id) ON DELETE SET NULL
                )
            """)
            # Create index
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(tag_name)")
            except Exception as e:
                pass

    @classmethod
    async def create(cls, tag_name: str, parent_id: Optional[int] = None) -> 'Tag':
        """Create a new tag"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO tags (tag_name, parent_id)
                VALUES ($1, $2)
                RETURNING id, tag_name, parent_id
            """, tag_name, parent_id)
            return cls(**dict(row))

    @classmethod
    async def get_by_id(cls, tag_id: int) -> Optional['Tag']:
        """Get tag by ID"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, tag_name, parent_id
                FROM tags WHERE id = $1
            """, tag_id)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_by_name(cls, tag_name: str) -> Optional['Tag']:
        """Get tag by name"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, tag_name, parent_id
                FROM tags WHERE tag_name = $1
            """, tag_name)
            return cls(**dict(row)) if row else None

    @classmethod
    async def get_all(cls) -> List['Tag']:
        """Get all tags"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, tag_name, parent_id
                FROM tags ORDER BY tag_name
            """)
            return [cls(**dict(row)) for row in rows]

    async def update(self, tag_name: Optional[str] = None, parent_id: Optional[int] = None) -> 'Tag':
        """Update tag name and/or parent_id"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            update_fields = []
            params = []
            if tag_name is not None:
                update_fields.append("tag_name = $%d" % (len(params) + 1))
                params.append(tag_name)
            if parent_id is not None:
                update_fields.append("parent_id = $%d" % (len(params) + 1))
                params.append(parent_id)
            if not update_fields:
                return self
            params.append(self.id)
            row = await conn.fetchrow(
                f"""
                UPDATE tags 
                SET {', '.join(update_fields)}
                WHERE id = ${len(params)}
                RETURNING id, tag_name, parent_id
                """,
                *params
            )
            return Tag(**dict(row))

    async def delete(self) -> bool:
        """Delete tag"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM tags WHERE id = $1", self.id)
            return result == "DELETE 1"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "tag_name": self.tag_name,
            "parent_id": self.parent_id
        }
