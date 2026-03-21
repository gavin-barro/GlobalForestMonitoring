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

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Metrics]:
        sql_statement = select(Metrics).offset(skip).limit(limit)
        result = await self.db.execute(sql_statement)
        return result.scalars().all()
    
    async def get_by_id(self, metric_id: int) -> Optional[Metrics]:
        sql_statement = select(Metrics).where(Metrics.metric_id == metric_id)
        result = await self.db.execute(sql_statement)
        return result.scalar_one_or_none()

    async def get_by_metric_name(self, metric_name: str) -> Optional[Metrics]:
        sql_statement = select(Metrics).where(Metrics.metric_name == metric_name)
        result = await self.db.execute(sql_statement)
        return result.scalar_one_or_none()
    
    async def create(self, metric_data: MetricCreate) -> Metrics:
        metric = Metrics(**metric_data.model_dump())
        self.db.add(metric)
        await self.commit()
        await self.refresh(metric)
        return metric

    async def update(self, metric_id: int, metric_update: MetricUpdate) -> Optional[Metrics]:
        metric = await self.get_by_id(metric_id)
        if not metric:
            return None

        update_data = metric_update.model_dump(exclude_unset=True)
        if update_data:
            sql_statement = (update(Metrics).where(Metrics.metric_id == metric_id).values(**update_data))
            await self.db.execute(sql_statement)
            await self.commit()
            await self.refresh(metric)
        return metric


    async def delete(self, metric_id: int) -> bool:
        metric = await self.get_by_id(metric_id)
        if not metric:
            return False
        await self.db.delete(metric)
        await self.commit()
        return True


class SubscriptionRepository(BaseRepository):
    """Repository for Subscription operations."""

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Subscriptions]:
        sql_statement = select(Subscriptions).offset(skip).limit(limit)
        result = await self.db.execute(sql_statement)
        return result.scalars().all()

    async def get_by_ids(self, user_id: int, metric_id: int, region_id: int) -> Optional[Subscriptions]:
        sql_statement = select(Subscriptions).where(
            Subscriptions.user_id == user_id,
            Subscriptions.metric_id == metric_id,
            Subscriptions.region_id == region_id
        )
        result = await self.db.execute(sql_statement)
        return result.scalar_one_or_none()

    async def get_by_user(self, user_id: int) -> List[Subscriptions]:
        sql_statement = select(Subscriptions).where(Subscriptions.user_id == user_id)
        result = await self.db.execute(sql_statement)
        return result.scalars().all()

    async def get_by_region(self, region_id: int) -> List[Subscriptions]:
        sql_statement = select(Subscriptions).where(Subscriptions.region_id == region_id)
        result = await self.db.execute(sql_statement)
        return result.scalars().all()

    async def get_by_metric(self, metric_id: int) -> List[Subscriptions]:
        sql_statement = select(Subscriptions).where(Subscriptions.metric_id == metric_id)
        result = await self.db.execute(sql_statement)
        return result.scalars().all()

    async def create(self, sub_data: SubscriptionCreate) -> Subscriptions:
        sub = Subscriptions(**sub_data.model_dump())
        self.db.add(sub)
        await self.commit()
        await self.refresh(sub)
        return sub

    async def update( self, user_id: int, metric_id: int, region_id: int, sub_update: SubscriptionUpdate) -> Optional[Subscriptions]:
        subscription = await self.get_by_ids(user_id, metric_id, region_id)
        if not subscription:
            return None

        update_data = sub_update.model_dump(exclude_unset=True)
        if update_data:
            stmt = (update(Subscriptions).where(
                    Subscriptions.user_id == user_id,
                    Subscriptions.metric_id == metric_id,
                    Subscriptions.region_id == region_id
                ).values(**update_data)
            )
            await self.db.execute(stmt)
            await self.commit()
            await self.refresh(subscription)
        return subscription

    async def delete(self, user_id: int, metric_id: int, region_id: int) -> bool:
        subscription = await self.get_by_ids(user_id, metric_id, region_id)
        if not subscription:
            return False
        await self.db.delete(subscription)
        await self.commit()
        return True

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

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ForestObservations]:
        sql_statement = select(ForestObservations).offset(skip).limit(limit)
        result = await self.db.execute(sql_statement)
        return result.scalars().all()
    
    async def get_by_id(self, fo_id: int) -> Optional[ForestObservations]:
        sql_statement = select(ForestObservations).where(ForestObservations.fo_id == fo_id)
        result = await self.db.execute(sql_statement)
        return result.scalar_one_or_none()

    async def get_by_region_id(self, region_id: int) -> Optional[ForestObservations]:
        sql_statement = select(ForestObservations).where(ForestObservations.region_id == region_id)
        result = await self.db.execute(sql_statement)
        return result.scalars().all()

    async def create(self, fo_data: FOCreate) -> ForestObservations:
        fo = ForestObservations(**fo_data.model_dump())
        self.db.add(fo)
        await self.commit()
        await self.refresh(fo)
        return fo

    async def update(self, fo_id: int, fo_update: FOUpdate) -> Optional[ForestObservations]:
        fo = await self.get_by_id(fo_id)
        if not fo:
            return None

        update_data = fo_update.model_dump(exclude_unset=True)
        if update_data:
            sql_statement = (update(ForestObservations).where(ForestObservations.fo_id == fo_id).values(**update_data))
            await self.db.execute(sql_statement)
            await self.commit()
            await self.refresh(fo)
        return fo

    async def delete(self, fo_id: int) -> bool:
        fo = await self.get_by_id(fo_id)
        if not fo:
            return False
        await self.db.delete(fo)
        await self.commit()
        return True


class TPRepository(BaseRepository):
    """Repository for TimePeriods operations."""

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[TimePeriods]:
        sql_statement = select(TimePeriods).offset(skip).limit(limit)
        result = await self.db.execute(sql_statement)
        return result.scalars().all()
    
    async def get_by_id(self, tp_id: int) -> Optional[TimePeriods]:
        sql_statement = select(TimePeriods).where(TimePeriods.tp_id == tp_id)
        result = await self.db.execute(sql_statement)
        return result.scalar_one_or_none()

    async def get_by_tp_name(self, tp_name: str) -> Optional[TimePeriods]:
        sql_statement = select(TimePeriods).where(TimePeriods.tp_name == tp_name)
        result = await self.db.execute(sql_statement)
        return result.scalar_one_or_none()

    async def create(self, tp_data: TPCreate) -> TimePeriods:
        tp = TimePeriods(**tp_data.model_dump())
        self.db.add(tp)
        await self.commit()
        await self.refresh(tp)
        return tp

    async def update(self, tp_id: int, tp_update: TPUpdate) -> Optional[TimePeriods]:
        tp = await self.get_by_id(tp_id)
        if not tp:
            return None

        update_data = tp_update.model_dump(exclude_unset=True)
        if update_data:
            sql_statement = (update(TimePeriods).where(TimePeriods.tp_id == tp_id).values(**update_data))
            await self.db.execute(sql_statement)
            await self.commit()
            await self.refresh(tp)
        return tp

    async def delete(self, tp_id: int) -> bool:
        tp = await self.get_by_id(tp_id)
        if not tp:
            return False
        await self.db.delete(tp)
        await self.commit()
        return True
    
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