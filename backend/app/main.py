from fastapi import FastAPI, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, UTC
from sqlalchemy import text
from .database import get_db
from .routers import users, regions, metrics, time_periods, subscriptions, forest_observations, pending_updates, region_classifications, land_cover_types, stats
import uvicorn

app = FastAPI(
    title = "Global Forest Watch Database System",
    description = "CS 5614 Database Management Final Project - Backend",
    version = "0.1.0",
    docs_url = "/docs",          
    redoc_url = "/redoc",  
    debug=True 
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex = r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

app.include_router(users.router)
app.include_router(regions.router)
app.include_router(subscriptions.router)
app.include_router(pending_updates.router)
app.include_router(time_periods.router)
app.include_router(metrics.router)
app.include_router(forest_observations.router)
app.include_router(region_classifications.router)
app.include_router(land_cover_types.router)
app.include_router(stats.router)

# Root endpoint - Test 
@app.get("/", tags = ["General"])
async def root():
    return {
        "message": "Welcome to Global Forest Watch Database System",
        "project": "CS 5614 - Database Management Final Project",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    
    Health check endpoint that verifies:
        - API is running
        - Database connection is active (tries a simple SELECT 1)
    Returns detailed status for monitoring/debugging.
    
    """
    try:
        # Simple query to test DB connection (async)
        result = await db.execute(text("SELECT 1"))
        db_ok = result.scalar() == 1
        
        return JSONResponse(
            content={
                "status": "healthy",
                "api": "online",
                "database": "connected" if db_ok else "disconnected",
                "timestamp": datetime.now(UTC).isoformat(),
                "details": {
                    "db_response": "SELECT 1 succeeded" if db_ok else "failed"
                }
            },
            status_code=200
        )
    
    except Exception as e:
        # Catch connection errors, timeouts, auth failures, etc.
        error_msg = str(e)
        status_code = 503 if "connect" in error_msg.lower() or "timeout" in error_msg.lower() else 500
        
        return JSONResponse(
            content={
                "status": "unhealthy",
                "api": "online",
                "database": "disconnected",
                "error": error_msg,
                "timestamp": datetime.now(UTC).isoformat()
            },
            status_code=status_code
        )

# Test api route
@app.get("/api/hello", tags = ["General"])
async def hello_world():
    return {"message": "backend is running!!"}

# How to run (from project root: python -m backend.app.main)
if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host = "0.0.0.0", port = 8000, reload = True, log_level = "info")