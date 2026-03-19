from fastapi import APIRouter, HTTPException, status
from typing import List
from ..schemas import UserCreate, UserResponse, UserUpdate

# Temporary -- TODO replace with real DB calls
users_db: List[dict] = []

router = APIRouter(
    prefix = "/users",
    tags = ["Users"],                    # Groups endpoints in /docs
    responses = {404: {"description": "User not found"}}
)


@router.get("/", response_model = List[UserResponse])
async def get_all_users():
    """Return list of all users (for admin/researcher later)"""
    return users_db


@router.get("/{user_id}", response_model = UserResponse)
async def get_user_by_id(user_id: int) -> dict:
    """Get a single user by ID"""
    user = next((u for u in users_db if u["user_id"] == user_id), None)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/", response_model = UserResponse, status_code = status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate) -> dict:
    """Create a new user (registration)"""
    # Simple ID generation for now (we'll use DB auto-increment later)
    new_id = max((u["user_id"] for u in users_db), default=0) + 1
    
    new_user = {
        "user_id": new_id,
        "username": user_data.username,
        "email": user_data.email,
        "acct_type": user_data.acct_type,
        "creation_date": user_data.creation_date,
        "last_login": None,
        "pw_hash": user_data.pw_hash   # TODO: will hash this with bcrypt
    }
    
    users_db.append(new_user)
    return new_user


@router.patch("/{user_id}", response_model = UserResponse)
async def update_user(user_id: int, user_update: UserUpdate) -> dict:
    """Update user information (profile, last_login, etc.)"""
    user = next((u for u in users_db if u["user_id"] == user_id), None)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.model_dump(exclude_unset=True)
    user.update(update_data)
    return user


@router.delete("/{user_id}", status_code = status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int) -> dict:
    """Delete a user (admin only later)"""
    global users_db
    user = next((u for u in users_db if u["user_id"] == user_id), None)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    users_db = [u for u in users_db if u["user_id"] != user_id]
    return None