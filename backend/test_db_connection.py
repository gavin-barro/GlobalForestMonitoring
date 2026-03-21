import os
import asyncio
from dotenv import load_dotenv
from sqlalchemy import text
from app.database import engine

load_dotenv()

print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")

async def test_connection():
    try:
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            print("ERROR: DATABASE_URL not set in .env file")
        else:
            async with engine.connect() as conn:
                print("✓ Database connection successful!")
                result = await conn.execute(text("SELECT 1"))
                print("✓ Database query successful!")
    except Exception as e:
        print(f"✗ Database connection failed: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())