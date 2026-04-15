from sqlalchemy import text, select, update
from sqlalchemy.ext.asyncio import AsyncSession

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

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Users]:
        sql_statement = select(Users).from_statement(
            text("SELECT * FROM users OFFSET :skip LIMIT :limit")
        )
        result = await self.db.execute(sql_statement, {"skip": skip, "limit": limit})
        return result.scalars().all()

    async def get_by_id(self, user_id: int) -> None | Users:
        sql_statement = select(Users).from_statement(
            text("SELECT * FROM users WHERE user_id = :user_id"))
        result = await self.db.execute(sql_statement, {"user_id": user_id})
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Users | None:
        sql_statement = select(Users).from_statement(
            text("SELECT * FROM users WHERE username = :username"))
        result = await self.db.execute(sql_statement, {"username": username})
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Users | None:
        sql_statement = select(Users).from_statement(
            text("SELECT * FROM users WHERE email = :email"))
        result = await self.db.execute(sql_statement, {"email": email})
        return result.scalar_one_or_none()

    async def create(self, user_data: UserCreate) -> Users:
        data = user_data.model_dump()

        sql = select(Users).from_statement(
            text("INSERT INTO users (username, pw_hash, acct_type, email, creation_date) \
                    VALUES (:username, :pw_hash, :acct_type, :email, :creation_date) " \
                    "RETURNING *"))
        result = await self.db.execute(sql, data)
        user = result.scalar_one()

        await self.commit()
        await self.refresh(user)
        return user

    async def update(self, user_id: int, user_update: UserUpdate) -> Users | None:
        user = await self.get_by_id(user_id)
        if not user:
            return None

        update_data = user_update.model_dump(exclude_unset=True)
        if update_data:
            set_clause = ", ".join([f"{key} = :{key}" for key in update_data.keys()])
            params = {**update_data, "user_id": user_id}
            sql_statement = text(f"""
                                 UPDATE users
                                 SET {set_clause}
                                 WHERE user_id = :user_id
                                 """)
            await self.db.execute(sql_statement, params)
            await self.commit()
            await self.refresh(user)
        return user

    async def delete(self, user_id: int) -> bool:
        if not await self.get_by_id(user_id):
            return False
        sql = text("DELETE FROM users WHERE user_id = :user_id")
        await self.db.execute(sql, {"user_id": user_id})
        await self.commit()
        return True


class RegionRepository(BaseRepository):
    """Repository for Region operations."""

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Regions]:
        sql_statement = select(Regions).from_statement(
            text("SELECT * FROM regions OFFSET :skip LIMIT :limit")
        )
        result = await self.db.execute(sql_statement, {"skip": skip, "limit": limit})
        return result.scalars().all()

    async def get_by_id(self, region_id: int) -> Regions | None:
        sql_statement = select(Regions).from_statement(
            text("SELECT * FROM regions WHERE region_id = :region_id")
        )
        result = await self.db.execute(sql_statement, {"region_id": region_id})
        return result.scalar_one_or_none()

    async def get_by_region_name(self, region_name: str) -> Users | None:
        sql_statement = select(Regions).from_statement(
            text("SELECT * FROM regions WHERE region_name = :region_name")
        )
        result = await self.db.execute(sql_statement, {"region_name": region_name})
        return result.scalar_one_or_none()

    async def create(self, region_data: RegionCreate) -> Regions:
        data = region_data.model_dump()
        sql_statement = select(Regions).from_statement(
            text("INSERT INTO regions (region_name, region_type, parent_region) \
                    VALUES (:region_name, :region_type, :parent_region_id) \
                    RETURNING *")
        )
        result = await self.db.execute(sql_statement, data)
        region = result.scalar_one()
        
        await self.commit()
        await self.refresh(region)
        return region

    async def update(self, region_id: int, region_update: RegionUpdate) -> Users | None:
    # We check if it exists first
        region = await self.get_by_id(region_id)
        if not region:
            return None

        update_data = region_update.model_dump(exclude_unset=True)
        if update_data:
            set_clause = ", ".join([f"{key} = :{key}" for key in update_data.keys()])
            params = {**update_data, "region_id": region_id}
            
            # Use select().from_statement() + RETURNING * # to ensure we get a mapped object back
            sql_statement = select(Regions).from_statement(
                text(f"""
                    UPDATE regions
                    SET {set_clause}
                    WHERE region_id = :region_id
                    RETURNING *
                """)
            )
            
            result = await self.db.execute(sql_statement, params)
            # Fetch the updated version from the result
            region = result.scalar_one_or_none()
            
            await self.commit()
            if region:
                await self.refresh(region)
                
        return region

    async def delete(self, region_id: int) -> bool:
        region = await self.get_by_id(region_id)
        if not region:
            return False
        sql = text("DELETE FROM regions WHERE region_id = :region_id")
        await self.db.execute(sql, {"region_id": region_id})
        await self.commit()
        return True


class MetricRepository(BaseRepository):
    """Repository for Metric operations."""

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Metrics]:
        sql_statement = select(Metrics).from_statement(
            text("SELECT * FROM metrics OFFSET :skip LIMIT :limit")
        )
        result = await self.db.execute(sql_statement, {"skip": skip, "limit": limit})
        return result.scalars().all()
    
    async def get_by_id(self, metric_id: int) -> Metrics | None:
        sql_statement = select(Metrics).from_statement(
            text("SELECT * FROM metrics WHERE metric_id = :metric_id")
        )
        result = await self.db.execute(sql_statement, {"metric_id": metric_id})
        return result.scalar_one_or_none()

    async def get_by_metric_name(self, metric_name: str) -> Metrics | None:
        sql_statement = select(Metrics).from_statement(
            text("SELECT * FROM metrics WHERE metric_name = :metric_name")
        )
        result = await self.db.execute(sql_statement, {"metric_name": metric_name})
        return result.scalar_one_or_none()
    
    async def create(self, metric_data: MetricCreate) -> Metrics:
        data = metric_data.model_dump()
        sql_statement = select(Metrics).from_statement(
            text("INSERT INTO metrics (metric_name, description, unit, value_type) \
                    VALUES (:metric_name, :description, :unit, :value_type) \
                    RETURNING *")
        )
        result = await self.db.execute(sql_statement, data)
        metric = result.scalar_one()
        
        await self.commit()
        await self.refresh(metric)
        return metric

    async def update(self, metric_id: int, metric_update: MetricUpdate) -> Metrics | None:
        metric = await self.get_by_id(metric_id)
        if not metric:
            return None

        update_data = metric_update.model_dump(exclude_unset=True)
        if update_data:
            set_clause = ", ".join([f"{key} = :{key}" for key in update_data.keys()])
            params = {**update_data, "metric_id": metric_id}
            sql_statement = text(f"""
                                 UPDATE metrics
                                 SET {set_clause}
                                 WHERE metric_id = :metric_id
                                 """)
            await self.db.execute(sql_statement, params)
            await self.commit()
            await self.refresh(metric)
        return metric


    async def delete(self, metric_id: int) -> bool:
        metric = await self.get_by_id(metric_id)
        if not metric:
            return False
        sql = text("DELETE FROM metrics WHERE metric_id = :metric_id")
        await self.db.execute(sql, {"metric_id": metric_id})
        await self.commit()
        return True


class SubscriptionRepository(BaseRepository):
    """Repository for Subscription operations."""

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Subscriptions]:
        sql_statement = select(Subscriptions).from_statement(
            text("SELECT * FROM subscriptions OFFSET :skip LIMIT :limit")
        )
        result = await self.db.execute(sql_statement, {"skip": skip, "limit": limit})
        return result.scalars().all()

    async def get_by_ids(self, user_id: int, metric_id: int, region_id: int) -> Subscriptions | None:
        sql_statement = select(Subscriptions).from_statement(
            text("SELECT * FROM subscriptions WHERE user_id = :user_id AND metric_id = :metric_id AND region_id = :region_id")
        )
        result = await self.db.execute(sql_statement, {"user_id": user_id, "metric_id": metric_id, "region_id": region_id})
        return result.scalar_one_or_none()

    async def get_by_user(self, user_id: int) -> list[Subscriptions]:
        sql_statement = select(Subscriptions).from_statement(
            text("SELECT * FROM subscriptions WHERE user_id = :user_id")
        )
        result = await self.db.execute(sql_statement, {"user_id": user_id})
        return result.scalars().all()

    async def get_by_region(self, region_id: int) -> list[Subscriptions]:
        sql_statement = select(Subscriptions).from_statement(
            text("SELECT * FROM subscriptions WHERE region_id = :region_id")
        )
        result = await self.db.execute(sql_statement, {"region_id": region_id})
        return result.scalars().all()

    async def get_by_metric(self, metric_id: int) -> list[Subscriptions]:
        sql_statement = select(Subscriptions).from_statement(
            text("SELECT * FROM subscriptions WHERE metric_id = :metric_id")
        )
        result = await self.db.execute(sql_statement, {"metric_id": metric_id})
        return result.scalars().all()

    async def create(self, sub_data: SubscriptionCreate) -> Subscriptions:
        data = sub_data.model_dump()
        sql_statement = select(Subscriptions).from_statement(
            text("INSERT INTO subscriptions (user_id, metric_id, region_id, active, threshold_value) \
                    VALUES (:user_id, :metric_id, :region_id, :active, :threshold_value)" \
                    "RETURNING *")
        )
        result = await self.db.execute(sql_statement, data)
        sub = result.scalar_one()

        await self.commit()
        await self.refresh(sub)
        return sub

    async def update(self, user_id: int, metric_id: int, region_id: int, 
                     sub_update: SubscriptionUpdate) -> Subscriptions | None:
        subscription = await self.get_by_ids(user_id, metric_id, region_id)
        if not subscription:
            return None

        update_data = sub_update.model_dump(exclude_unset=True)
        if update_data:
            set_clause = ", ".join([f"{key} = :{key}" for key in update_data.keys()])
            params = {**sub_update.model_dump(), "user_id": user_id, "metric_id": metric_id, "region_id": region_id}
            stmt = select(Subscriptions).from_statement(
                text(f"""
                    UPDATE subscriptions
                    SET {set_clause}
                    WHERE user_id = :user_id AND metric_id = :metric_id AND region_id = :region_id
                    RETURNING *
                """))
            await self.db.execute(stmt, params)
            
            await self.commit()
            await self.refresh(subscription)
        return subscription

    async def delete(self, user_id: int, metric_id: int, region_id: int) -> bool:
        subscription = await self.get_by_ids(user_id, metric_id, region_id)
        if not subscription:
            return False
        sql = text("DELETE FROM subscriptions WHERE user_id = :user_id AND metric_id = :metric_id AND region_id = :region_id")
        await self.db.execute(sql, {"user_id": user_id, "metric_id": metric_id, "region_id": region_id})
        await self.commit()
        return True

class LCTRepository(BaseRepository):
    """
        Async repository for LandCoverTypes operations
    """

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[LandCoverTypes]:
        stmt = select(LandCoverTypes).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, lct_id: int) -> LandCoverTypes | None:
        stmt = select(LandCoverTypes).where(LandCoverTypes.lct_id == lct_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, lct_data: LCTCreate) -> LandCoverTypes:
        lct = LandCoverTypes(**lct_data.model_dump())
        self.db.add(lct)
        await self.commit()      
        await self.refresh(lct) 
        return lct

    async def update(self, lct_id: int, lct_update: LCTUpdate) -> LandCoverTypes | None:
        lct = await self.get_by_id(lct_id)
        if not lct:
            return None

        update_data = lct_update.model_dump(exclude_unset=True)
        if update_data:
            stmt = (
                update(LandCoverTypes)
                .where(LandCoverTypes.lct_id == lct_id)
                .values(**update_data)
            )
            await self.db.execute(stmt)
            await self.commit()
            await self.refresh(lct)
        return lct

    async def delete(self, lct_id: int) -> bool:
        lct = await self.get_by_id(lct_id)
        if not lct:
            return False
        await self.db.delete(lct)
        await self.commit()
        return True


class FORepository(BaseRepository):
    """Repository for ForestObservations operations."""

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[ForestObservations]:
        sql_statement = select(ForestObservations).from_statement(
            text("SELECT * FROM forest_observations OFFSET :skip LIMIT :limit")
        )
        result = await self.db.execute(sql_statement, {"skip": skip, "limit": limit})
        return result.scalars().all()
    
    async def get_by_id(self, fo_id: int) -> ForestObservations | None:
        sql_statement = select(ForestObservations).from_statement(
            text("SELECT * FROM forest_observations WHERE observation_id = :observation_id")
        )
        result = await self.db.execute(sql_statement, {"observation_id": fo_id})
        return result.scalar_one_or_none()

    async def get_by_region_id(self, region_id: int) -> ForestObservations | None:
        sql_statement = select(ForestObservations).from_statement(
            text("SELECT * FROM forest_observations WHERE describing_region_id = :region_id")
        )
        result = await self.db.execute(sql_statement, {"region_id": region_id})
        return result.scalars().all()

    async def create(self, fo_data: FOCreate) -> ForestObservations:
        data = fo_data.model_dump()
        sql = select(ForestObservations).from_statement(
            text("INSERT INTO forest_observations (value, source_date, observation_period_id, observation_metric, describing_region_id) \
                    VALUES (:value, :source_date, :period_id, :metric_id, :region_id) \
                    RETURNING *")
        )
        result = await self.db.execute(sql, data)
        fo = result.scalar_one()

        await self.commit()
        await self.refresh(fo)
        return fo

    async def update(self, fo_id: int, fo_update: FOUpdate) -> ForestObservations | None:
        fo = await self.get_by_id(fo_id)
        if not fo:
            return None

        update_data = fo_update.model_dump(exclude_unset=True)
        if update_data:
            set_clause = ", ".join([f"{key} = :{key}" for key in update_data.keys()])
            params = {**update_data, "observation_id": fo_id}
            sql_statement = select(ForestObservations).from_statement(text(f"""
                                 UPDATE forest_observations
                                 SET {set_clause}
                                 WHERE observation_id = :observation_id
                                 RETURNING *"""))
            await self.db.execute(sql_statement, params)
            await self.commit()
            await self.refresh(fo)
        return fo

    async def delete(self, fo_id: int) -> bool:
        fo = await self.get_by_id(fo_id)
        if not fo:
            return False
        sql = text("DELETE FROM forest_observations WHERE observation_id = :observation_id")
        await self.db.execute(sql, {"observation_id": fo_id})
        await self.commit()
        return True


class TPRepository(BaseRepository):
    """Repository for TimePeriods operations."""

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[TimePeriods]:
        sql_statement = select(TimePeriods).from_statement(
            text("SELECT * FROM time_periods OFFSET :skip LIMIT :limit")
        )
        result = await self.db.execute(sql_statement, {"skip": skip, "limit": limit})
        return result.scalars().all()
    
    async def get_by_id(self, tp_id: int) -> TimePeriods | None:
        sql_statement = select(TimePeriods).from_statement(
            text("SELECT * FROM time_periods WHERE period_id = :period_id")
        )
        result = await self.db.execute(sql_statement, {"period_id": tp_id})
        return result.scalar_one_or_none()

    async def get_by_tp_name(self, tp_name: str) -> TimePeriods | None:
        sql_statement = select(TimePeriods).from_statement(
            text("SELECT * FROM time_periods WHERE period_name = :period_name")
        )
        result = await self.db.execute(sql_statement, {"period_name": tp_name})
        return result.scalar_one_or_none()

    async def create(self, tp_data: TPCreate) -> TimePeriods:
        data = tp_data.model_dump()
        sql = select(TimePeriods).from_statement(
            text("INSERT INTO time_periods (period_name, start_year, end_year) \
                    VALUES (:period_name, :start_year, :end_year) \
                    RETURNING *")
        )
        result = await self.db.execute(sql, data)
        tp = result.scalar_one()

        await self.commit()
        await self.refresh(tp)
        return tp

    async def update(self, tp_id: int, tp_update: TPUpdate) -> TimePeriods | None:
        tp = await self.get_by_id(tp_id)
        if not tp:
            return None

        update_data = tp_update.model_dump(exclude_unset=True)
        if update_data:
            set_clause = ", ".join([f"{key} = :{key}" for key in update_data.keys()])
            params = {**update_data, "period_id": tp_id}
            sql_statement = select(TimePeriods).from_statement(text(f"""
                                 UPDATE time_periods
                                 SET {set_clause}
                                 WHERE period_id = :period_id
                                 RETURNING *"""))
            await self.db.execute(sql_statement, params)
            await self.commit()
            await self.refresh(tp)
        return tp

    async def delete(self, tp_id: int) -> bool:
        tp = await self.get_by_id(tp_id)
        if not tp:
            return False
        sql = text("DELETE FROM time_periods WHERE period_id = :period_id")
        await self.db.execute(sql, {"period_id": tp_id})
        await self.commit()
        return True
    
class PURepository(BaseRepository):
    """
        Async repository for PendingUpdates operations
    """

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[PendingUpdates]:
        stmt = select(PendingUpdates).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, pu_id: int) -> PendingUpdates | None:
        stmt = select(PendingUpdates).where(PendingUpdates.update_id == pu_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_submitting_user_id(self, su_id: int) -> list[PendingUpdates]:
        stmt = select(PendingUpdates).where(PendingUpdates.submitting_user_id == su_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_active(self) -> list[PendingUpdates]:
        # pending updates where status = 'pending'??!?!
        stmt = select(PendingUpdates).where(PendingUpdates.status == "pending")
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def create(self, pu_data: PUCreate) -> PendingUpdates:
        pu = PendingUpdates(**pu_data.model_dump())
        self.db.add(pu)
        await self.commit()
        await self.refresh(pu)
        return pu

    async def update(self, pu_id: int, pu_update: PUUpdate) -> PendingUpdates | None:
        pu = await self.get_by_id(pu_id)
        if not pu:
            return None

        update_data = pu_update.model_dump(exclude_unset=True)
        if update_data:
            stmt = (
                update(PendingUpdates)
                .where(PendingUpdates.update_id == pu_id)
                .values(**update_data)
            )
            await self.db.execute(stmt)
            await self.commit()
            await self.refresh(pu)
        return pu

    async def delete(self, pu_id: int) -> bool:
        pu = await self.get_by_id(pu_id)
        if not pu:
            return False

        await self.db.delete(pu)
        await self.commit()
        return True
    
class RCRepository(BaseRepository):
    """
        Async repository for RegionClassification operations
    """

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[RegionClassification]:
        stmt = select(RegionClassification).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, region_id: int, lct_id: int) -> RegionClassification | None:
        stmt = select(RegionClassification).where(
            RegionClassification.region_id == region_id,
            RegionClassification.lct_id == lct_id
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_lct_id(self, lct_id: int) -> list[RegionClassification]:
        stmt = select(RegionClassification).where(RegionClassification.lct_id == lct_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_region_id(self, region_id: int) -> list[RegionClassification]:
        stmt = select(RegionClassification).where(RegionClassification.region_id == region_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def create(self, rc_data: RCCreate) -> RegionClassification:
        rc = RegionClassification(**rc_data.model_dump())
        self.db.add(rc)                  
        await self.commit()
        await self.refresh(rc)
        return rc

    async def delete(self, lct_id: int, region_id: int) -> bool:
        rc = await self.get_by_id(region_id, lct_id)
        if not rc:
            return False
        
        await self.db.delete(rc)
        await self.commit()
        return True