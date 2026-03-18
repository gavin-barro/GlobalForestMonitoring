from app.database import engine, Base
from app import models  # Ensure all models are imported so Base knows them

def init_db():
    try:
        # This command talks to Railway and creates any missing tables
        Base.metadata.create_all(bind=engine)
        print("✅ Tables synced successfully with Railway!")
    except Exception as e:
        print(f"❌ Error syncing tables: {e}")

if __name__ == "__main__":
    init_db()