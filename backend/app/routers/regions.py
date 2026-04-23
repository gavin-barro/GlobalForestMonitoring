# backend/app/routers/regions.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas import RegionCreate, RegionUpdate, RegionResponse
from ..database import get_db
from ..repositories import RegionRepository

router = APIRouter(
    prefix="/regions",
    tags=["Regions"],
    responses={404: {"description": "Region not found"}}
)

@router.get("/", response_model=List[RegionResponse])
async def get_all_regions(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
        List all regions with pagination (for admin/researcher/viewer browsing)
    """
    repository = RegionRepository(db)
    regions = await repository.get_all(skip=skip, limit=limit)
    return regions

@router.get("/{region_id}", response_model=RegionResponse)
async def get_region(region_id: int, db: AsyncSession = Depends(get_db)):
    """
        Get a single region by ID (including parent/sub info via relationships)
    """
    repository = RegionRepository(db)
    region = await repository.get_by_id(region_id)
    if region is None:
        raise HTTPException(status_code=404, detail="Region not found")
    return region

@router.get("/by-name/{region_name}", response_model=RegionResponse)
async def get_region_by_name(region_name: str, db: AsyncSession = Depends(get_db)):
    """
        Search region by exact name (useful for frontend search/autocomplete)
    """
    repository = RegionRepository(db)
    region = await repository.get_by_region_name(region_name)
    if region is None:
        raise HTTPException(status_code=404, detail="Region not found")
    return region

@router.get("/search/{query}", response_model=List[RegionResponse])
async def search_regions(query: str, db: AsyncSession = Depends(get_db)):
    """
        Search region by partial name (useful for frontend search/autocomplete)
    """
    repository = RegionRepository(db)
    regions = await repository.search_by_region_name_partial(query)
    return regions

@router.post("/", response_model=RegionResponse, status_code=status.HTTP_201_CREATED)
async def create_region(region_data: RegionCreate, db: AsyncSession = Depends(get_db)):
    """
        Create a new region — supports hierarchy via parent_region_id -- TODO: admin only later
    """
    repository = RegionRepository(db)

    # Safety check: if a parent is specified, make sure it exists
    if region_data.parent_region_id is not None:
        parent = await repository.get_by_id(region_data.parent_region_id)
        if not parent:
            raise HTTPException(status_code=400, detail="Parent region does not exist")

    new_region = await repository.create(region_data)
    return new_region

@router.patch("/{region_id}", response_model=RegionResponse)
async def update_region(region_id: int, region_update: RegionUpdate, db: AsyncSession = Depends(get_db)):
    """
        Partial update of a region (e.g., change name, type, parent)
    """
    repository = RegionRepository(db)
    updated = await repository.update(region_id, region_update)
    if updated is None:
        raise HTTPException(status_code=404, detail="Region not found")
    return updated

@router.delete("/{region_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_region(region_id: int, db: AsyncSession = Depends(get_db)):
    """
        Delete a region (admin only, cascade or restrict sub-regions later)
    """
    repository = RegionRepository(db)
    success = await repository.delete(region_id)
    if not success:
        raise HTTPException(status_code=404, detail="Region not found")
    return None