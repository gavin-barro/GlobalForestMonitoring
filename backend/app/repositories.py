from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
from app.models import (
    Users, Metrics, TimePeriods, LandCoverTypes,
    Regions, ForestObservations, Subscriptions,
    RegionClassification, PendingUpdates
)


class BaseRepository:
    """Base repository with common database operations."""

    def __init__(self, db: Session):
        self.db = db

    def commit(self):
        """Commit changes to database."""
        self.db.commit()

    def refresh(self, obj):
        """Refresh object from database."""
        self.db.refresh(obj)


class UserRepository(BaseRepository):
    """Repository for User operations."""

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Users]:
        return self.db.query(Users).offset(skip).limit(limit).all()

    def get_by_id(self, user_id: int) -> Optional[Users]:
        return self.db.query(Users).filter(Users.user_id == user_id).first()

    def get_by_username(self, username: str) -> Optional[Users]:
        return self.db.query(Users).filter(Users.username == username).first()

    def get_by_email(self, email: str) -> Optional[Users]:
        return self.db.query(Users).filter(Users.email == email).first()

    def create(self, user_data: Dict[str, Any]) -> Users:
        user = Users(**user_data)
        self.db.add(user)
        self.commit()
        self.refresh(user)
        return user

    def update(self, user_id: int, user_data: Dict[str, Any]) -> Optional[Users]:
        user = self.get_by_id(user_id)
        if user:
            for key, value in user_data.items():
                setattr(user, key, value)
            self.commit()
            self.refresh(user)
        return user

    def delete(self, user_id: int) -> bool:
        user = self.get_by_id(user_id)
        if user:
            self.db.delete(user)
            self.commit()
            return True
        return False