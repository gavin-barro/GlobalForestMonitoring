from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
# from .database import get_db, engine, etc.  TODO
# from .routers import users, regions, reports, subscriptions, pending_updates, time_periods, metrics, etc. TODO

app = FastAPI(
    title = "Global Forest Watch Database System",
    description = "CS 5614 Database Management Final Project - Backend",
    version = "0.1.0",
    docs_url = "/docs",          
    redoc_url = "/redoc",   
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

# TODO: add all the routers
# app.include_router(users.router)
# app.include_router(regions.router)
# app.include_router(reports.router)
# app.include_router(subscriptions.router)
# app.include_router(pending_updates.router)
# app.include_router(time_periods.router)
# app.include_router(metrics.router)

# Root endpoint - Test 
@app.get("/", tags = ["General"])
async def root():
    return {
        "message": "Welcome to Global Forest Watch Database System",
        "project": "CS 5614 - Database Management Final Project",
        "status": "online",
        "docs": "/docs"
    }

# DB (railway) health check 
@app.get("/health", tags = ["Health"])
async def health_check():
    # TODO: make it so we check here if we are connected to the db
    return JSONResponse(
        content = {"status": "healthy", "database": "not connected yet"},
        status_code = 200
    )


# Test api route
@app.get("/api/hello", tags = ["General"])
async def hello_world():
    return {"message": "backend is running!!"}


"""
    TODO: Add additional API routes so we can send information from the backend to the fronend and vice 
    versa  -- in the routers folder
    
    Gavin can work on this part

"""

# How to run (from project root: python -m backend.app.main)
if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host = "0.0.0.0", port = 8000, reload = True, log_level = "info")