from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from .. import schemas
from ..database import get_db
from ..repositories import RegionRepository

router = APIRouter(
    prefix="/regions",
    tags=["Regions"],
    responses={404: {"description": "Region not found"}}
)

@router.get("/", response_model=List[schemas.RegionResponse])
async def get_all_regions(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
        List all regions with pagination (for admin/researcher/viewer browsing)
    """
    repo = RegionRepository(db) 
    regions = await repo.get_all(skip=skip, limit=limit)
    return regions


@router.get("/{region_id}", response_model=schemas.RegionResponse)
async def get_region(region_id: int, db: AsyncSession = Depends(get_db)):
    """
        Get a single region by ID (including parent/sub info via relationships)
    """
    repo = RegionRepository(db)
    region = await repo.get_by_id(region_id)
    if region is None:
        raise HTTPException(status_code=404, detail="Region not found")
    return region


@router.get("/by-name/{region_name}", response_model=schemas.RegionResponse)
async def get_region_by_name(region_name: str, db: AsyncSession = Depends(get_db)):
    """
        Search region by exact name (useful for frontend search/autocomplete)
    """
    repo = RegionRepository(db)
    region = await repo.get_by_region_name(region_name)
    if region is None:
        raise HTTPException(status_code=404, detail="Region not found")
    return region


@router.post("/", response_model=schemas.RegionResponse, status_code=status.HTTP_201_CREATED)
async def create_region(region_data: schemas.RegionCreate, db: AsyncSession = Depends(get_db)):
    """
        Create a new region (admin only later) — supports hierarchy via parent_region_id
    """
    repo = RegionRepository(db)
    if region_data.parent_region_id == region_data.region_id:
        raise HTTPException(status_code=400, detail="Region cannot be its own parent")
    
    new_region = await repo.create(region_data)
    return new_region


@router.patch("/{region_id}", response_model=schemas.RegionResponse)
async def update_region(region_id: int, region_update: schemas.RegionUpdate, db: AsyncSession = Depends(get_db)):
    """
        Partial update of a region (e.g., change name, type, parent)
    """
    repo = RegionRepository(db)
    updated = await repo.update(region_id, region_update)
    if updated is None:
        raise HTTPException(status_code=404, detail="Region not found")
    return updated


@router.delete("/{region_id}", status_code = status.HTTP_204_NO_CONTENT)
async def delete_region(region_id: int, db: AsyncSession = Depends(get_db)):
    """
        Delete a region (admin only, cascade or restrict sub-regions later)
    """
    repo = RegionRepository(db)
    success = await repo.delete(region_id)
    if not success:
        raise HTTPException(status_code=404, detail="Region not found")
    return None