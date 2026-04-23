from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from ..schemas import SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse
from ..database import get_db
from ..repositories import RegionRepository, SubscriptionRepository, UserRepository, MetricRepository

router = APIRouter(
    prefix="/subscriptions",
    tags=["Subscriptions"],
    responses={404: {"description": "Subscription not found"}}
)

@router.get("/", response_model=List[SubscriptionResponse])
async def get_all_subscriptions(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
        List all subscriptions (admin/researcher use, paginated)
    """
    repository = SubscriptionRepository(db)
    subscription = await repository.get_all(skip=skip, limit=limit)
    return subscription

@router.get("/by-user/{user_id}", response_model=List[SubscriptionResponse])
async def get_subscriptions_by_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """
        Get all active subscriptions for a specific user (viewer/researcher dashboard)
    """
    repository = SubscriptionRepository(db)
    subscription = await repository.get_by_user(user_id)
    return subscription

@router.get("/{user_id}/{metric_id}/{region_id}", response_model=SubscriptionResponse)
async def get_subscription(user_id: int, metric_id: int, region_id: int, db: AsyncSession = Depends(get_db)):
    """
        Get a specific subscription by composite key
    """
    repository = SubscriptionRepository(db)
    subscription = await repository.get_by_ids(user_id, metric_id, region_id)
    if subscription is None:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return subscription

@router.post("/", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription(sub_data: SubscriptionCreate, db: AsyncSession = Depends(get_db)):
    """Subscribe a user to a metric in a region (with optional threshold)"""
    repository = SubscriptionRepository(db)
    user_repository = UserRepository(db)
    metric_repository = MetricRepository(db)
    region_repository = RegionRepository(db)

    # Validate foreign keys    
    user = await user_repository.get_by_id(sub_data.user_id)
    if not user:
        raise HTTPException(status_code=400, detail="User does not exist")
    
    metric = await metric_repository.get_by_id(sub_data.metric_id)
    if not metric:
        raise HTTPException(status_code=400, detail="Metric does not exist")
    
    region = await region_repository.get_by_id(sub_data.region_id)
    if not region:  
        raise HTTPException(status_code=400, detail="Region does not exist")

    # Optional: check if already subscribed
    existing = await repository.get_by_ids(sub_data.user_id, sub_data.metric_id, sub_data.region_id)
    if existing:
        raise HTTPException(status_code=400, detail="User already subscribed to this metric in region")
    
    new_sub = await repository.create(sub_data)
    return new_sub

@router.patch("/{user_id}/{metric_id}/{region_id}", response_model=SubscriptionResponse)
async def update_subscription(user_id: int, metric_id: int, region_id: int, sub_update: SubscriptionUpdate, db: AsyncSession = Depends(get_db)):
    """
        Partial update (e.g., toggle active, change threshold for alerts)
    """
    repository = SubscriptionRepository(db)
    user_repository = UserRepository(db)
    metric_repository = MetricRepository(db)
    region_repository = RegionRepository(db)


    if sub_update.active is not None:

        # Check if subscription already exists
        
        existing = await repository.get_by_ids(user_id, metric_id, region_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Subscription not found")
        
        # Validate foreign keys if they are being updated

        user = await user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=400, detail="User does not exist")
        
        metric = await metric_repository.get_by_id(metric_id)
        if not metric:
            raise HTTPException(status_code=400, detail="Metric does not exist")

        region = await region_repository.get_by_id(region_id)
        if not region:  
            raise HTTPException(status_code=400, detail="Region does not exist")

    updated = await repository.update(user_id, metric_id, region_id, sub_update)
    if updated is None:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return updated

@router.delete("/{user_id}/{metric_id}/{region_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subscription(user_id: int, metric_id: int, region_id: int, db: AsyncSession = Depends(get_db)):
    """
        Unsubscribe (should delete the subscription)
    """
    repository = SubscriptionRepository(db)
    success = await repository.delete(user_id, metric_id, region_id)
    if not success:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return None