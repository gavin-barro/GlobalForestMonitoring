from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator, Optional
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration
# Supports both postgresql+psycopg (preferred for psycopg v3) and postgresql (legacy)
DATABASE_URL = os.getenv("DATABASE_URL")

# Create SQLAlchemy async engine with connection pooling
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    pool_size=10,  # Number of connections to keep in the pool
    max_overflow=20,  # Maximum overflow connections
    pool_pre_ping=True,  # Test connections before using them
    pool_recycle=3600,  # Recycle connections after 1 hour
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False, autoflush=False, autocommit=False)

# Create declarative base for models - async verison
class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncGenerator[Optional[AsyncSession]]:
    """
        FastAPI dependency: returns an async DB session per request
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()