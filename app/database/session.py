import logging
from typing import AsyncGenerator
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import get_settings

logger = logging.getLogger("news_ai.database")
settings = get_settings()

# Create asynchronous database engine
engine: AsyncEngine = create_async_engine(
    settings.async_database_url,
    echo=(settings.LOG_LEVEL.upper() == "DEBUG"),  # Log SQL queries only in DEBUG mode
    pool_pre_ping=True,  # Automatically check if connection is alive before using it
    pool_size=5,         # Light pool size suitable for low-resource server
    max_overflow=10,
)

# Async session factory
async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency / context helper for acquiring database sessions."""
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def check_db_connection() -> str:
    """Execute a simple query to verify database connectivity."""
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT version();"))
        version = result.scalar_one()
        return str(version)