from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
from typing import List, Optional
from app.database import engine, get_db, init_db, Base
from app.repositories import UserRepository, MetricsRepository, ForestObservationsRepository, RegionsRepository
from app.schemas import (
    UserResponse, UserCreate, UserUpdate,
    MetricResponse, MetricCreate, MetricUpdate,
    ForestObservationResponse, ForestObservationCreate, ForestObservationUpdate,
    RegionResponse, RegionCreate, RegionUpdate,
    APIResponse, ErrorResponse, PaginationParams
)

# Lifespan event handler (replaces deprecated @app.on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    print("Database initialized")
    yield
    # Shutdown
    print("Application shutdown")

# Create FastAPI app with lifespan
app = FastAPI(title="Global Forest Monitoring API", version="1.0.0", lifespan=lifespan)

@app.get("/")
def root():
    """Root endpoint - redirects to API documentation."""
    return {
        "message": "Global Forest Monitoring API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "health": "/health",
            "metrics": {
                "list": "/metrics/",
                "get": "/metrics/{metric_id}",
                "create": "/metrics/",
                "update": "/metrics/{metric_id}",
                "delete": "/metrics/{metric_id}"
            },
            "users": {
                "list": "/users/",
                "get": "/users/{user_id}",
                "create": "/users/",
                "update": "/users/{user_id}",
                "delete": "/users/{user_id}"
            },
            "observations": {
                "list": "/observations/",
                "get": "/observations/{observation_id}",
                "create": "/observations/",
                "update": "/observations/{observation_id}",
                "delete": "/observations/{observation_id}"
            },
            "regions": {
                "list": "/regions/",
                "get": "/regions/{region_id}",
                "subregions": "/regions/{region_id}/subregions"
            }
        }
    }


@app.get("/users/", response_model=List[UserResponse])
def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all users from the database."""
    repo = UserRepository(db)
    users = repo.get_all(skip=skip, limit=limit)
    return users

@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user by ID."""
    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/users/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user."""
    repo = UserRepository(db)
    try:
        return repo.create(user.dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating user: {str(e)}")

@app.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    """Update an existing user."""
    repo = UserRepository(db)
    updated_user = repo.update(user_id, user_update.dict(exclude_unset=True))
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user."""
    repo = UserRepository(db)
    if not repo.delete(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)