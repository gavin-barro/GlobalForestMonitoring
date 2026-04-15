from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas import LCTCreate, LCTUpdate, LCTResponse
from ..database import get_db
from ..repositories import LCTRepository

router = APIRouter(
    prefix="/land_cover_types",
    tags=["LandCoverTypes"],
    responses={404: {"description": "LandCoverType not found"}}
)

@router.get("/", response_model=List[LCTResponse])
async def get_all_LandCoverTypes(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
        List all LandCoverTypes with pagination (for admin/researcher/viewer browsing)
    """
    repository = LCTRepository(db)
    lct = await repository.get_all(skip=skip, limit=limit)
    return lct

@router.get("/{lct_id}", response_model=LCTResponse)
async def get_LandCoverType(lct_id: int, db: AsyncSession = Depends(get_db)):
    """
        Get a single LandCoverType by ID (including parent/sub info via relationships)
    """
    repository = LCTRepository(db)
    lct = await repository.get_by_id(lct_id)
    if lct is None:
        raise HTTPException(status_code=404, detail="LandCoverType not found")
    return lct

@router.get("/by-name/{lct_name}", response_model=LCTResponse)
async def get_LandCoverType_by_name(lct_name: str, db: AsyncSession = Depends(get_db)):
    """
        Search LandCoverType by exact name (useful for frontend search/autocomplete)
    """
    repository = LCTRepository(db)
    lct = await repository.get_by_lct_name(lct_name)
    if lct is None:
        raise HTTPException(status_code=404, detail="LandCoverType not found")
    return lct

@router.post("/", response_model=LCTResponse, status_code=status.HTTP_201_CREATED)
async def create_LandCoverType(lct_data: LCTCreate, db: AsyncSession = Depends(get_db)):
    """
        Create a new LandCoverType — supports hierarchy via parent_LandCoverType_id -- TODO: admin only later
    """
    repository = LCTRepository(db)

    new_LandCoverType = await repository.create(lct_data)
    return new_LandCoverType

@router.patch("/{lct_id}", response_model=LCTResponse)
async def update_LandCoverType(lct_id: int, LandCoverType_update: LCTUpdate, db: AsyncSession = Depends(get_db)):
    """
        Partial update of a LandCoverType (e.g., change name, type, parent)
    """
    repository = LCTRepository(db)
    updated = await repository.update(lct_id, LandCoverType_update)
    if updated is None:
        raise HTTPException(status_code=404, detail="LandCoverType not found")
    return updated

@router.delete("/{lct_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_LandCoverType(lct_id: int, db: AsyncSession = Depends(get_db)):
    """
        Delete a LandCoverType
    """
    repository = LCTRepository(db)
    success = await repository.delete(lct_id)
    if not success:
        raise HTTPException(status_code=404, detail="LandCoverType not found")
    return None