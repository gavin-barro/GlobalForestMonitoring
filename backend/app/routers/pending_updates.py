from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..schemas import PUCreate, PUUpdate, PUResponse
from ..database import get_db
from ..repositories import PURepository

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

    new_pu = await repository.create(pu_data)
    return new_pu

@router.patch("/{pu_id}", response_model=PUResponse)
async def update_pending_update(pu_id: int, pu_update: PUUpdate, db: AsyncSession = Depends(get_db)):
    """
        Partial update of a PendingUpdate (e.g., change name, type, parent)
    """
    repository = PURepository(db)
    updated = await repository.update(pu_id, pu_update)
    if updated is None:
        raise HTTPException(status_code=404, detail="PendingUpdate not found")
    return updated

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