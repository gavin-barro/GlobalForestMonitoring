from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..repositories import StatsRepository
from ..dependencies.auth import get_current_user

router = APIRouter(
    prefix="/stats",
    tags=["Statistics"]
)

@router.get("/viewer/{user_id}")
async def get_viewer_reports(user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Fetch the 5 required statistical reports for a Viewer/Subscriber
    """
    repo = StatsRepository(db)
    stats = await repo.get_viewer_stats(user_id)
    return stats

@router.get("/guest")
async def get_guest_reports(db: AsyncSession = Depends(get_db)):
    """
    Fetch the 5 required statistical reports for a Guest (Global view).
    """
    repo = StatsRepository(db)
    stats = await repo.get_guest_stats()
    return stats

@router.get("/admin")
async def get_admin_reports(db: AsyncSession = Depends(get_db)):
    """
    Fetch the 5 required statistical reports for an Administrator.
    """
    repo = StatsRepository(db)
    stats = await repo.get_admin_stats()
    return stats

@router.get("/researcher/{user_id}")
async def get_researcher_reports(user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Fetch the 5 required statistical reports for a Researcher.
    """
    repo = StatsRepository(db)
    stats = await repo.get_researcher_stats(user_id)
    return stats



