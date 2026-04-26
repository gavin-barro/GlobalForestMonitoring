from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..schemas import PUCreate, PUUpdate, PUResponse
from ..database import get_db
from ..repositories import PURepository, UserRepository
from ..dependencies.auth import get_admin_user, get_current_user

router = APIRouter(
    prefix="/pending_updates",
    tags=["PendingUpdates"],
    responses={404: {"description": "PendingUpdate not found"}}
)

@router.get("/", response_model=list[PUResponse])
async def get_all_pending_updates(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
        List all PendingUpdates with pagination (for admin/researcher/viewer browsing)
    """
    repository = PURepository(db)
    pu = await repository.get_all(skip=skip, limit=limit)
    return pu

@router.get("/pending", response_model=List[PUResponse])
async def get_active_pending_update(db: AsyncSession = Depends(get_db)):
    """
        Get a list of pending updates that are active
    """
    repository = PURepository(db)
    pu = await repository.get_by_pending()
    if pu is None:
        raise HTTPException(status_code=404, detail="No active PendingUpdate found")
    return pu

@router.get("/{pu_id}", response_model=PUResponse)
async def get_pending_update(pu_id: int, db: AsyncSession = Depends(get_db)):
    """
        Get a single PendingUpdate by ID (including parent/sub info via relationships)
    """
    repository = PURepository(db)
    pu = await repository.get_by_id(pu_id)
    if pu is None:
        raise HTTPException(status_code=404, detail="PendingUpdate not found")
    return pu

@router.get("/submitting_user_id/{su_id}", response_model=List[PUResponse])
async def get_pending_update_by_submitting_user_id(su_id: int, db: AsyncSession = Depends(get_db)):
    """
        Get a list of PendingUpdates by submitting_user_id
    """
    repository = PURepository(db)
    pu = await repository.get_by_submitting_user_id(su_id)
    if pu is None:
        raise HTTPException(status_code=404, detail="PendingUpdate not found for user")
    return pu


@router.post("/", response_model=PUResponse, status_code=status.HTTP_201_CREATED)
async def create_pending_update(pu_data: PUCreate, db: AsyncSession = Depends(get_db)):
    """
        Create a new PendingUpdate
    """
    repository = PURepository(db)
    user_repository = UserRepository(db)

    # Validate user ids
    user = await user_repository.get_by_id(pu_data.submitting_user_id)
    if not user:
        raise HTTPException(status_code=400, detail="Submitting user does not exist")
    
    new_pu = await repository.create(pu_data)
    return new_pu

@router.patch("/{pu_id}", response_model=PUResponse)
async def update_pending_update(pu_id: int, pu_update: PUUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """
        Partial update of a PendingUpdate (e.g., change name, type, parent)
    """
    repository = PURepository(db)
    user_repo = UserRepository(db)

    is_admin = current_user.get("acct_type") in ["Administrator", "Admin"]


    if not is_admin:
        # If not admin, they can only update their own proposal
        pu = await repository.get_by_id(pu_id)
        if not pu or pu.submitting_user_id != current_user.get("user_id"):
            raise HTTPException(status_code=403, detail="Only the submitting researcher or an admin can update this proposal")
    
    # Check if we are trying to approve via this generic update endpoint (we shouldn't)
    if pu_update.status == "Approved":
        raise HTTPException(status_code=400, detail="Use the /approve/{id} endpoint to authorize updates")


    # If updating as admin, allow updating approving_admin_id
    if is_admin and pu_update.approving_admin_id is not None:
        user = await user_repo.get_by_id(pu_update.approving_admin_id)
        if not user:
            raise HTTPException(status_code=400, detail="Target admin user does not exist")


    updated = await repository.update(pu_id, pu_update)
    if updated is None:
        raise HTTPException(status_code=404, detail="PendingUpdate not found")
    return updated

@router.patch("/approve/{pu_id}", response_model=PUResponse)
async def approve_pending_update(pu_id: int, db: AsyncSession = Depends(get_db), admin: dict = Depends(get_admin_user)):
    """
        ADMIN ONLY: Approve a PendingUpdate (set pending=False, apply changes to parent if applicable)
    """
    repository = PURepository(db)

    # Dependency get_admin_user already verified the role
    if not admin:
        raise HTTPException(status_code=403, detail="Admin privileges required to approve pending updates")


    approved = await repository.approve(pu_id)
    if approved is None:
        raise HTTPException(status_code=404, detail="PendingUpdate not found")
    return approved

@router.delete("/{pu_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pending_update(pu_id: int, db: AsyncSession = Depends(get_db)):
    """
        Delete a PendingUpdate
    """
    repository = PURepository(db)
    success = await repository.delete(pu_id)
    if not success:
        raise HTTPException(status_code=404, detail="PendingUpdate not found")
    return None