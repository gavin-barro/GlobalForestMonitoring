from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..schemas import TPCreate, TPUpdate, TPResponse
from ..database import get_db
from ..repositories import TPRepository
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/time_periods",
    tags=["TimePeriods"],
    responses={404: {"description": "Time Periods not found"}}
)

@router.get("/", response_model=List[TPResponse])
async def get_all_tps(skip: int = 0,limit: int = 100,db: AsyncSession = Depends(get_db)):
    """
        Retrieve a paginated list of all time periods in the system
        Useful for admin overview or researcher lookups
    """
    repo = TPRepository(db)
    tps = await repo.get_all(skip=skip, limit=limit)
    return tps


@router.get("/{tp_id}", response_model=TPResponse)
async def get_tp(tp_id: int, db: AsyncSession = Depends(get_db)):
    """
        Retrieve a single Time Period by their ID
        Returns 404 if Time Period does not exist
    """
    repo = TPRepository(db)
    tp = await repo.get_by_id(tp_id)
    if tp is None:
        raise HTTPException(status_code=404, detail="Time Period not found")
    return tp


@router.get("/by_name/{tp_name}", response_model=TPResponse)
async def get_tp(tp_name: str, db: AsyncSession = Depends(get_db)):
    """
        Retrieve a list of Time Periods based on the regions id
        Returns 404 if tp does not exist
    """
    repo = TPRepository(db)
    tps = await repo.get_by_tp_name(tp_name)
    if tps is None:
        raise HTTPException(status_code=404, detail="Time Period not found in region")
    return tps


@router.post("/", response_model=TPResponse, status_code=status.HTTP_201_CREATED)
async def create_tp(tp_data: TPCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new Time Period:
        - start and end date must be valid datetime before time.now() (TODO: implement date checking)
    """
    repo = TPRepository(db)

    # Basic uniqueness check before insert -- technicly option but improves error message in case or error
    existing = await repo.get_by_tp_name(tp_data.period_name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Time Period already exists"
        )

    new_tp = await repo.create(tp_data)
    return new_tp


@router.patch("/{tp_id}", response_model=TPResponse)
async def update_tp(tp_id: int, tp_update: TPUpdate,db: AsyncSession = Depends(get_db)):
    """
        Partially update timePeriod information
        Only fields provided in request body are changed
    """
    repo = TPRepository(db)
    updated_tp = await repo.update(tp_id, tp_update)

    if updated_tp is None:
        raise HTTPException(status_code=404, detail="Time Period not found")

    return updated_tp


@router.delete("/{tp_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_metric(tp_id: int, db: AsyncSession = Depends(get_db)):
    """
        Delete a Time Period by ID
        Returns 204 No Content on success
    """
    repo = TPRepository(db)
    success = await repo.delete(tp_id)

    if not success:
        raise HTTPException(status_code=404, detail="Time Period not found")

    return None