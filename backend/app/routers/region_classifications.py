from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..schemas import RCCreate, RCResponse
from ..database import get_db
from ..repositories import LCTRepository, RCRepository, RegionRepository
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/region_classifications",
    tags=["RegionClassifications"],
    responses={404: {"description": "Region Classification not found"}}
)

@router.get("/", response_model=List[RCResponse])
async def get_all_region_classifications(skip: int = 0,limit: int = 100,db: AsyncSession = Depends(get_db)):
    """
        Retrieve a paginated list of all Region Classifications in the system
        Useful for admin overview or researcher lookups
    """
    repo = RCRepository(db)
    rcs = await repo.get_all(skip=skip, limit=limit)
    return rcs

@router.get("/lct/{lct_id}", response_model=List[RCResponse])
async def get_all_lct_classifications(lct_id: int, db: AsyncSession = Depends(get_db)):
    """
        Retrieve a paginated list of all Region Classifications in the system
        Useful for admin overview or researcher lookups
    """
    repo = RCRepository(db)
    rcs = await repo.get_by_lct_id(lct_id)
    return rcs

@router.get("/region/{region_id}", response_model=List[RCResponse])
async def get_all_region_classifications(region_id: int, db: AsyncSession = Depends(get_db)):
    """
        Retrieve a paginated list of all Region Classifications in the system
        Useful for admin overview or researcher lookups
    """
    repo = RCRepository(db)
    rcs = await repo.get_by_region_id(region_id=region_id)
    return rcs

@router.get("/{region_id}/{lct_id}", response_model=RCResponse)
async def get_region_classification(region_id: int, lct_id: int, db: AsyncSession = Depends(get_db)):
    """
        Retrieve a single Region Classification by their ID
        Returns 404 if Region Classification does not exist
    """
    repo = RCRepository(db)
    rc = await repo.get_by_id(region_id, lct_id)
    if rc is None:
        raise HTTPException(status_code=404, detail="Region Classification not found")
    return rc


@router.post("/", response_model=RCResponse, status_code=status.HTTP_201_CREATED)
async def create_region_classification(rc_data: RCCreate, db: AsyncSession = Depends(get_db)):
    """
        Create a new region classification
    """
    repo = RCRepository(db)
    region_repo = RegionRepository(db)
    lct_repo = LCTRepository(db)

    # Validate foreign keys
    region = await region_repo.get_by_id(rc_data.rc_region_id)
    if not region:
        raise HTTPException(status_code=400, detail="Region does not exist")
    
    lct = await lct_repo.get_by_id(rc_data.lct_id)
    if not lct:
        raise HTTPException(status_code=400, detail="LCT does not exist")

    new_region_classification = await repo.create(rc_data)
    return new_region_classification


@router.delete("/{region_id}/{lct_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_region_classification(region_id: int, lct_id: int, db: AsyncSession = Depends(get_db)):
    """
        Delete a Region Classification account by ID
        Returns 204 No Content on success
        Later: protect with admin-only dependency
    """
    repo = RCRepository(db)
    success = await repo.delete(region_id, lct_id)

    if not success:
        raise HTTPException(status_code=404, detail="Region Classification not found")

    return None