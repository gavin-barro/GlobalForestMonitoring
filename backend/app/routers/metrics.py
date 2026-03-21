from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..schemas import MetricCreate, MetricUpdate, MetricResponse
from ..database import get_db
from ..repositories import MetricRepository
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/metrics",
    tags=["Metrics"],
    responses={404: {"description": "Metric not found"}}
)

@router.get("/", response_model=List[MetricResponse])
async def get_all_metrics(skip: int = 0,limit: int = 100,db: AsyncSession = Depends(get_db)):
    """
        Retrieve a paginated list of all metrics in the system
        Useful for admin overview or researcher lookups
    """
    repo = MetricRepository(db)
    metrics = await repo.get_all(skip=skip, limit=limit)
    return metrics


@router.get("/by_metric_id/{metric_id}", response_model=MetricResponse)
async def get_metric(metric_id: int, db: AsyncSession = Depends(get_db)):
    """
        Retrieve a single metric by their ID
        Returns 404 if metric does not exist
    """
    repo = MetricRepository(db)
    metric = await repo.get_by_id(metric_id)
    if metric is None:
        raise HTTPException(status_code=404, detail="metric not found")
    return metric

@router.get("/by_metric_name/{metric_name}", response_model=MetricResponse)
async def get_metric(metric_name: str, db: AsyncSession = Depends(get_db)):
    """
        Retrieve a single metric by their name
        Returns 404 if metric does not exist
    """
    repo = MetricRepository(db)
    metric = await repo.get_by_metric_name(metric_name)
    if metric is None:
        raise HTTPException(status_code=404, detail="metric not found")
    return metric


@router.post("/", response_model=MetricResponse, status_code=status.HTTP_201_CREATED)
async def create_metric(metric_data: MetricCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new metric account:
        - metric_name must be unique
    """
    repo = MetricRepository(db)

    # Basic uniqueness check before insert -- technicly option but improves error message in case or error
    existing = await repo.get_by_metric_name(metric_data.metric_name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Metric already exists"
        )

    new_metric = await repo.create(metric_data)
    return new_metric


@router.patch("/{metric_id}", response_model=MetricResponse)
async def update_metric(metric_id: int, metric_update: MetricUpdate,db: AsyncSession = Depends(get_db)):
    """
        Partially update Metric information
        Only fields provided in request body are changed
    """
    repo = MetricRepository(db)
    updated_metric = await repo.update(metric_id, metric_update)

    if updated_metric is None:
        raise HTTPException(status_code=404, detail="Metric not found")

    return updated_metric


@router.delete("/{metric_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_metric(metric_id: int, db: AsyncSession = Depends(get_db)):
    """
        Delete a metric account by ID
        Returns 204 No Content on success
    """
    repo = MetricRepository(db)
    success = await repo.delete(metric_id)

    if not success:
        raise HTTPException(status_code=404, detail="Metric not found")

    return None