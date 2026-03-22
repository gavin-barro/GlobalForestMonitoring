from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from typing import List
from ..schemas import FOCreate, FOUpdate, FOResponse
from ..database import get_db
from ..repositories import FORepository
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/forest_observations",
    tags=["ForestObservations"],
    responses={404: {"description": "Forest Observation not found"}}
)

@router.get("/", response_model=List[FOResponse])
async def get_all_fos(skip: int = 0,limit: int = 100,db: AsyncSession = Depends(get_db)):
    """
        Retrieve a paginated list of all forest observations in the system
        Useful for admin overview or researcher lookups
    """
    repo = FORepository(db)
    fos = await repo.get_all(skip=skip, limit=limit)
    return fos


@router.get("/{fo_id}", response_model=FOResponse)
async def get_fo(fo_id: int, db: AsyncSession = Depends(get_db)):
    """
        Retrieve a single forest observation by their ID
        Returns 404 if forest observation does not exist
    """
    repo = FORepository(db)
    fo = await repo.get_by_id(fo_id)
    if fo is None:
        raise HTTPException(status_code=404, detail="forest observation not found")
    return fo


@router.get("/by_region/{region_id}", response_model=List[FOResponse])
async def get_fos_by_region(region_id: int, db: AsyncSession = Depends(get_db)):
    """
        Retrieve a list of forest observations based on the regions id
        Returns 404 if fo does not exist
    """
    repo = FORepository(db)
    fos = await repo.get_by_region_id(region_id)
    if not fos:
        raise HTTPException(status_code=404, detail="forest observation not found in region")
    return fos


@router.post("/", response_model=FOResponse, status_code=status.HTTP_201_CREATED)
async def create_fo(fo_data: FOCreate, db: AsyncSession = Depends(get_db)):
    repository = FORepository(db)
    try:
        new_forest_observation = await repository.create(fo_data)
        return new_forest_observation
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A forest observation for this region, period, and metric already exists"
        )


@router.patch("/{fo_id}", response_model=FOResponse)
async def update_fo(fo_id: int, fo_update: FOUpdate,db: AsyncSession = Depends(get_db)):
    """
        Partially update ForestObservation information
        Only fields provided in request body are changed
    """
    repo = FORepository(db)
    updated_fo = await repo.update(fo_id, fo_update)

    if updated_fo is None:
        raise HTTPException(status_code=404, detail="Forest Observation not found")

    return updated_fo


@router.delete("/{fo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_metric(fo_id: int, db: AsyncSession = Depends(get_db)):
    """
        Delete a forest observation by ID
        Returns 204 No Content on success
    """
    repo = FORepository(db)
    success = await repo.delete(fo_id)

    if not success:
        raise HTTPException(status_code=404, detail="Forest Observation not found")

    return None