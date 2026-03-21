from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from .models import (
    Users, Metrics, TimePeriods, LandCoverTypes,
    Regions, ForestObservations, Subscriptions,
    RegionClassification, PendingUpdates
)

from .schemas import (
    UserCreate, UserUpdate, RegionCreate, RegionUpdate,
    MetricCreate, MetricUpdate, SubscriptionCreate, SubscriptionUpdate,
    LCTCreate, LCTUpdate, TPCreate, TPUpdate, PUCreate, PUUpdate, RCCreate,
    FOCreate, FOUpdate
)


class BaseRepository:
    """Base repository with common database operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def commit(self):
        """Commit changes to database."""
        await self.db.commit()

    async def refresh(self, obj):
        """Refresh object from database."""
        await self.db.refresh(obj)


class UserRepository(BaseRepository):
    """Repository for User operations."""

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Users]:
        sql_statement = select(Users).offset(skip).limit(limit)
        result = await self.db.execute(sql_statement)
        return result.scalars().all()

    async def get_by_id(self, user_id: int) -> Optional[Users]:
        sql_statement = select(Users).where(Users.user_id == user_id)
        result = await self.db.execute(sql_statement)
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[Users]:
        sql_statement = select(Users).where(Users.username == username)
        result = await self.db.execute(sql_statement)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[Users]:
        sql_statement = select(Users).where(Users.email == email)
        result = await self.db.execute(sql_statement)
        return result.scalar_one_or_none()

    async def create(self, user_data: UserCreate) -> Users:
        user = Users(**user_data.model_dump())
        self.db.add(user)
        await self.commit()
        await self.refresh(user)
        return user

    async def update(self, user_id: int, user_update: UserUpdate) -> Optional[Users]:
        user = await self.get_by_id(user_id)
        if not user:
            return None

        update_data = user_update.model_dump(exclude_unset=True)
        if update_data:
            sql_statement = (update(Users).where(Users.user_id == user_id).values(**update_data))
            await self.db.execute(sql_statement)
            await self.commit()
            await self.refresh(user)
        return user

    async def delete(self, user_id: int) -> bool:
        user = await self.get_by_id(user_id)
        if not user:
            return False
        await self.db.delete(user)
        await self.commit()
        return True


class RegionRepository(BaseRepository):
    """Repository for Region operations."""

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Regions]:
        sql_statement = select(Regions).offset(skip).limit(limit)
        result = await self.db.execute(sql_statement)
        return result.scalars().all()

    async def get_by_id(self, region_id: int) -> Optional[Regions]:
        sql_statement = select(Regions).where(Regions.region_id == region_id)
        result = await self.db.execute(sql_statement)
        return result.scalar_one_or_none()

    async def get_by_region_name(self, region_name: str) -> Optional[Regions]:
        sql_statement = select(Regions).where(Regions.region_name == region_name)
        result = await self.db.execute(sql_statement)
        return result.scalar_one_or_none()

    async def create(self, region_data: RegionCreate) -> Regions:
        region = Regions(**region_data.model_dump())
        self.db.add(region)
        await self.commit()
        await self.refresh(region)
        return region

    async def update(self, region_id: int, region_update: RegionUpdate) -> Optional[Regions]:
        region = await self.get_by_id(region_id)
        if not region:
            return None

        update_data = region_update.model_dump(exclude_unset=True)
        if update_data:
            sql_statement = (update(Regions).where(Regions.region_id == region_id).values(**update_data))
            await self.db.execute(sql_statement)
            await self.commit()
            await self.refresh(region)
        return region

    async def delete(self, region_id: int) -> bool:
        region = await self.get_by_id(region_id)
        if not region:
            return False
        await self.db.delete(region)
        await self.commit()
        return True


class MetricRepository(BaseRepository):
    """Repository for Metric operations."""

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Metrics]:
        return self.db.query(Metrics).offset(skip).limit(limit).all()

    def get_by_id(self, metric_id: int) -> Optional[Metrics]:
        return self.db.query(Metrics).filter(Metrics.metric_id == metric_id).first()

    def get_by_metric_name(self, metric_name: str) -> Optional[Metrics]:
        return self.db.query(Metrics).filter(Metrics.metric_name == metric_name).first()

    def create(self, metric_data: MetricCreate) -> Metrics:
        metric = Metrics(**metric_data.model_dump())
        self.db.add(metric)
        self.commit()
        self.refresh(metric)
        return metric

    def update(self, metric_id: int, metric_update: MetricUpdate) -> Optional[Metrics]:
        metric = self.get_by_id(metric_id)
        if metric:
            metric_data = metric_update.model_dump(exclude_unset=True)
            for key, value in metric_data.items():
                setattr(metric, key, value)
            self.commit()
            self.refresh(metric)
        return metric

    def delete(self, metric_id: int) -> bool:
        metric = self.get_by_id(metric_id)
        if metric:
            self.db.delete(metric)
            self.commit()
            return True
        return False


class SubscriptionRepository(BaseRepository):
    """Repository for Subscription operations."""

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Subscriptions]:
        return self.db.query(Subscriptions).offset(skip).limit(limit).all()

    def get_by_id(self, user_id: int, region_id: int, metric_id: int) -> Optional[Subscriptions]:
        return self.db.query(Subscriptions).filter(
            Subscriptions.user_id == user_id,
            Subscriptions.region_id == region_id,
            Subscriptions.metric_id == metric_id
        ).first()

    def get_by_user_id(self, user_id: int) -> Optional[List[Subscriptions]]:
        return self.db.query(Subscriptions).filter(Subscriptions.user_id == user_id).all()

    def get_by_region_id(self, region_id: int) -> Optional[List[Subscriptions]]:
        return self.db.query(Subscriptions).filter(Subscriptions.region_id == region_id).all()

    def create(self, sub_data: SubscriptionCreate) -> Subscriptions:
        sub = Subscriptions(**sub_data.model_dump())
        self.db.add(sub)
        self.commit()
        self.refresh(sub)
        return sub

    def update(self, user_id: int, region_id: int, metric_id: int, sub_update: SubscriptionUpdate) -> Optional[Subscriptions]:
        sub = self.get_by_id(user_id, region_id, metric_id)
        if sub:
            sub_data = sub_update.model_dump(exclude_unset=True)
            for key, value in sub_data.items():
                setattr(sub, key, value)
            self.commit()
            self.refresh(sub)
        return sub

    def delete(self, user_id: int, region_id: int, metric_id: int) -> bool:
        sub = self.get_by_id(user_id, region_id, metric_id)
        if sub:
            self.db.delete(sub)
            self.commit()
            return True
        return False


class LCTRepository(BaseRepository):
    """Repository for LandCoverTypes operations."""

    def get_all(self, skip: int = 0, limit: int = 100) -> List[LandCoverTypes]:
        return self.db.query(LandCoverTypes).offset(skip).limit(limit).all()

    def get_by_id(self, lct_id: int) -> Optional[LandCoverTypes]:
        return self.db.query(LandCoverTypes).filter(LandCoverTypes.lct_id == lct_id).first()

    def get_by_lct_name(self, lct_type_name: str) -> Optional[LandCoverTypes]:
        return self.db.query(LandCoverTypes).filter(LandCoverTypes.lct_type_name == lct_type_name).first()

    def create(self, lct_data: LCTCreate) -> LandCoverTypes:
        lct = LandCoverTypes(**lct_data.model_dump())
        self.db.add(lct)
        self.commit()
        self.refresh(lct)
        return lct

    def update(self, lct_id: int, lct_update: LCTUpdate) -> Optional[LandCoverTypes]:
        lct = self.get_by_id(lct_id)
        if lct:
            lct_data = lct_update.model_dump(exclude_unset=True)
            for key, value in lct_data.items():
                setattr(lct, key, value)
            self.commit()
            self.refresh(lct)
        return lct

    def delete(self, lct_id: int) -> bool:
        lct = self.get_by_id(lct_id)
        if lct:
            self.db.delete(lct)
            self.commit()
            return True
        return False


class FORepository(BaseRepository):
    """Repository for ForestObservations operations."""

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ForestObservations]:
        return self.db.query(ForestObservations).offset(skip).limit(limit).all()

    def get_by_id(self, ob_id: int) -> Optional[ForestObservations]:
        return self.db.query(ForestObservations).filter(ForestObservations.ob_id == ob_id).first()

    def get_by_region_id(self, region_id: int) -> Optional[ForestObservations]:
        return self.db.query(ForestObservations).filter(ForestObservations.region_id == region_id).first()

    def create(self, ob_data: FOCreate) -> ForestObservations:
        ob = ForestObservations(**ob_data.model_dump())
        self.db.add(ob)
        self.commit()
        self.refresh(ob)
        return ob

    def update(self, ob_id: int, ob_update: FOUpdate) -> Optional[ForestObservations]:
        ob = self.get_by_id(ob_id)
        if ob:
            ob_data = ob_update.model_dump(exclude_unset=True)
            for key, value in ob_data.items():
                setattr(ob, key, value)
            self.commit()
            self.refresh(ob)
        return ob

    def delete(self, ob_id: int) -> bool:
        ob = self.get_by_id(ob_id)
        if ob:
            self.db.delete(ob)
            self.commit()
            return True
        return False

class TPRepository(BaseRepository):
    """Repository for TimePeriods operations."""

    def get_all(self, skip: int = 0, limit: int = 100) -> List[TimePeriods]:
        return self.db.query(TimePeriods).offset(skip).limit(limit).all()

    def get_by_id(self, tp_id: int) -> Optional[TimePeriods]:
        return self.db.query(TimePeriods).filter(TimePeriods.tp_id == tp_id).first()

    def get_by_tp_name(self, tp_name: str) -> Optional[TimePeriods]:
        return self.db.query(TimePeriods).filter(TimePeriods.tp_name == tp_name).first()

    def create(self, tp_data: TPCreate) -> TimePeriods:
        tp = TimePeriods(**tp_data.model_dump())
        self.db.add(tp)
        self.commit()
        self.refresh(tp)
        return tp

    def update(self, tp_id: int, tp_update: TPUpdate) -> Optional[TimePeriods]:
        tp = self.get_by_id(tp_id)
        if tp:
            tp_data = tp_update.model_dump(exclude_unset=True)
            for key, value in tp_data.items():
                setattr(tp, key, value)
            self.commit()
            self.refresh(tp)
        return tp

    def delete(self, tp_id: int) -> bool:
        tp = self.get_by_id(tp_id)
        if tp:
            self.db.delete(tp)
            self.commit()
            return True
        return False
    
class PURepository(BaseRepository):
    """Repository for PendingUpdates operations."""

    def get_all(self, skip: int = 0, limit: int = 100) -> List[PendingUpdates]:
        return self.db.query(PendingUpdates).offset(skip).limit(limit).all()

    def get_by_id(self, pu_id: int) -> Optional[PendingUpdates]:
        return self.db.query(PendingUpdates).filter(PendingUpdates.pu_id == pu_id).first()
    
    def get_by_submitting_user_id(self, su_id: int) -> Optional[PendingUpdates]:
        return self.db.query(PendingUpdates).filter(PendingUpdates.submitting_user_id == su_id).all()

    def get_by_active(self) -> Optional[PendingUpdates]:
        return self.db.query(PendingUpdates).filter(PendingUpdates.status).all()

    def create(self, pu_data: PUCreate) -> PendingUpdates:
        pu = PendingUpdates(**pu_data.model_dump())
        self.db.add(pu)
        self.commit()
        self.refresh(pu)
        return pu

    def update(self, pu_id: int, pu_update: PUUpdate) -> Optional[PendingUpdates]:
        pu = self.get_by_id(pu_id)
        if pu:
            pu_data = pu_update.model_dump(exclude_unset=True)
            for key, value in pu_data.items():
                setattr(pu, key, value)
            self.commit()
            self.refresh(pu)
        return pu

    def delete(self, pu_id: int) -> bool:
        pu = self.get_by_id(pu_id)
        if pu:
            self.db.delete(pu)
            self.commit()
            return True
        return False
    
class RCRepository(BaseRepository):
    """Repository for RegionClassification operations."""

    def get_all(self, skip: int = 0, limit: int = 100) -> List[RegionClassification]:
        return self.db.query(RegionClassification).offset(skip).limit(limit).all()

    def get_by_id(self, region_id: int, lct_id: int) -> Optional[RegionClassification]:
        return self.db.query(RegionClassification).filter(
            RegionClassification.region_id == region_id,
            RegionClassification.lct_id == lct_id

        ).first()
     
    def get_by_submitting_lct_id(self, lct_id: int) -> Optional[RegionClassification]:
        return self.db.query(RegionClassification).filter(RegionClassification.lct_id == lct_id).all()

    def create(self, rc_data: RCCreate) -> RegionClassification:
        rc = RegionClassification(**rc_data.model_dump())
        self.db.add(rc)
        self.commit()
        self.refresh(rc)
        return rc

    def delete(self, rc_id: int) -> bool:
        rc = self.get_by_id(rc_id)
        if rc:
            self.db.delete(rc)
            self.commit()
            return True
        return False