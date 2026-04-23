from ..schemas import UserCreate, UserUpdate, UserResponse
from ..database import get_db
from ..repositories import UserRepository
from ..utils.password import hash_password, verify_password
from ..dependencies.auth import create_access_token, get_admin_user
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    responses={404: {"description": "User not found"}}
)

@router.get("/", response_model=list[UserResponse])
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
async def create_user(user_data: UserCreate, db: AsyncSession = Depends(get_db)) -> UserResponse:
    """
        Create a new user account with properly hashed password
    """
    repo = UserRepository(db)

    # Uniqueness checks
    if await repo.get_by_username(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    if await repo.get_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash the password before saving
    hashed_pw = hash_password(user_data.pw_hash)

    # Create a new UserCreate object with the hashed password
    user_to_create = UserCreate(
        username=user_data.username,
        email=user_data.email,
        acct_type=user_data.acct_type,
        pw_hash=hashed_pw,                    
        creation_date=user_data.creation_date,
        user_id=user_data.user_id        
    )

    new_user = await repo.create(user_to_create)
    return new_user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_update: UserUpdate, db: AsyncSession = Depends(get_db)) -> UserResponse:
    """
        Partially update user information
        If a new password is provided, it will be hashed
    """
    repo = UserRepository(db)

    update_data = user_update.model_dump(exclude_unset=True)

    # If password is being updated, hash it first
    if "pw_hash" in update_data and update_data["pw_hash"]:
        update_data["pw_hash"] = hash_password(update_data["pw_hash"])

    # Create a new UserUpdate object with hashed password
    updated_user_data = UserUpdate(**update_data)
    updated_user = await repo.update(user_id, updated_user_data)

    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return updated_user


@router.post("/login")
async def login( username: str, password: str, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    user = await repo.get_by_username(username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    # Use pwdlib verify function
    if not verify_password(password, user.pw_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    access_token = create_access_token(
        data={"sub": str(user.user_id), "acct_type": user.acct_type}
    )

    return {"access_token": access_token, "token_type": "bearer"}


# UpDaTE --- Delete is now admin-only
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db), 
                      admin: dict = Depends(get_admin_user)) -> None:
    """
        ADMIN ONLY: Delete a user account by ID
    """
    repo = UserRepository(db)
    success = await repo.delete(user_id)

    if not success:
        raise HTTPException(status_code=404, detail="User not found")