from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..schemas import UserCreate, UserUpdate, UserResponse
from ..database import get_db
from ..repositories import UserRepository
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    responses={404: {"description": "User not found"}}
)

@router.get("/", response_model=List[UserResponse])
async def get_all_users(skip: int = 0,limit: int = 100,db: AsyncSession = Depends(get_db)):
    """
        Retrieve a paginated list of all users in the system
        Useful for admin overview or researcher lookups
    """
    repo = UserRepository(db)
    users = await repo.get_all(skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """
        Retrieve a single user by their ID
        Returns 404 if user does not exist
    """
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new user account:
        - Username and email must be unique (enforced by DB constraints)
        - Password is stored as hash (TODO: implement proper bcrypt hashing)
        - AcctType should be one of: 'admin', 'researcher', 'viewer' (add enum/check later)
        - creation_date is set from input or auto-generated
    """
    repo = UserRepository(db)

    # Basic uniqueness check before insert -- technicly option but improves error message in case or error
    existing = await repo.get_by_username(user_data.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    existing_email = await repo.get_by_email(user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # TODO: hash PASSWORD

    new_user = await repo.create(user_data)
    return new_user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int,user_update: UserUpdate,db: AsyncSession = Depends(get_db)):
    """
        Partially update user information
        Only fields provided in request body are changed
        Useful for updating last_login, email, acct_type, etc
    """
    repo = UserRepository(db)
    updated_user = await repo.update(user_id, user_update)

    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return updated_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """
        Delete a user account by ID
        Returns 204 No Content on success
        Later: protect with admin-only dependency
    """
    repo = UserRepository(db)
    success = await repo.delete(user_id)

    if not success:
        raise HTTPException(status_code=404, detail="User not found")

    return None