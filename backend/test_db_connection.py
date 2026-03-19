import os
from dotenv import load_dotenv
from sqlalchemy import text
from app.database import engine

load_dotenv()

print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")

try:
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("ERROR: DATABASE_URL not set in .env file")
    else:
        with engine.connect() as conn:
            print("✓ Database connection successful!")
            result = conn.execute(text("SELECT 1"))
            print("✓ Database query successful!")
except Exception as e:
    print(f"✗ Database connection failed: {type(e).__name__}: {e}")
