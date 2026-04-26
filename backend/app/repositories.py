from sqlalchemy import text, select, update
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

    async def search_by_region_name_partial(self, query: str) -> list[Regions]:
        sql_statement = select(Regions).from_statement(
            text("SELECT * FROM regions WHERE region_name ILIKE :query")
        )
        result = await self.db.execute(sql_statement, {"query": f"%{query}%"})
        return result.scalars().all()

    async def create(self, region_data: RegionCreate) -> Regions:
        data = region_data.model_dump()
        sql_statement = select(Regions).from_statement(
            text("INSERT INTO regions (region_name, region_type, parent_region, geo_boundary) \
                    VALUES (:region_name, :region_type, :parent_region_id, :geo_boundary) \
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
    """Repository for LandCoverTypes operations."""

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[LandCoverTypes]:
        sql_statement = select(LandCoverTypes).from_statement(
            text("SELECT * FROM land_cover_types OFFSET :skip LIMIT :limit")
        )
        result = await self.db.execute(sql_statement, {"skip": skip, "limit": limit})
        return result.scalars().all()
    
    async def get_by_id(self, lct_id: int) -> LandCoverTypes | None:
        sql_statement = select(LandCoverTypes).from_statement(
            text("SELECT * FROM land_cover_types WHERE lct_id = :lct_id")
        )
        result = await self.db.execute(sql_statement, {"lct_id": lct_id})
        return result.scalar_one_or_none()

    async def get_by_lct_name(self, type_name: str) -> LandCoverTypes | None:
        sql_statement = select(LandCoverTypes).from_statement(
            text("SELECT * FROM land_cover_types WHERE type_name = :type_name")
        )
        result = await self.db.execute(sql_statement, {"type_name": type_name})
        return result.scalar_one_or_none()

    async def create(self, lct_data: LCTCreate) -> LandCoverTypes:
        data = lct_data.model_dump()
        sql = select(LandCoverTypes).from_statement(
            text("INSERT INTO land_cover_types (type_name, category, description) \
                    VALUES (:type_name, :category, :description) \
                    RETURNING *")
        )
        result = await self.db.execute(sql, data)
        lct = result.scalar_one()

        await self.commit()
        await self.refresh(lct)
        return lct
    
    async def update(self, lct_id: int, lct_update: LCTUpdate) -> LandCoverTypes | None:
        lct = await self.get_by_id(lct_id)
        if not lct:
            return None

        update_data = lct_update.model_dump(exclude_unset=True)
        if update_data:
            set_clause = ", ".join([f"{key} = :{key}" for key in update_data.keys()])
            params = {**update_data, "lct_id": lct_id}
            sql_statement = select(LandCoverTypes).from_statement(text(f"""
                                 UPDATE land_cover_types
                                 SET {set_clause}
                                 WHERE lct_id = :lct_id
                                 RETURNING *"""))
            await self.db.execute(sql_statement, params)
            await self.commit()
            await self.refresh(lct)
        return lct

    async def delete(self, lct_id: int) -> bool:
        lct = await self.get_by_id(lct_id)
        if not lct:
            return False
        sql = text("DELETE FROM land_cover_types WHERE lct_id = :lct_id")
        await self.db.execute(sql, {"lct_id": lct_id})
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

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[PendingUpdates]:
        sql_statement = select(PendingUpdates).from_statement(
            text("SELECT * FROM pending_updates OFFSET :skip LIMIT :limit")
        )
        result = await self.db.execute(sql_statement, {"skip": skip, "limit": limit})
        return result.scalars().all()

    async def get_by_id(self, update_id: int) -> Optional[PendingUpdates]:
        sql_statement = select(PendingUpdates).from_statement(
            text("SELECT * FROM pending_updates WHERE update_id = :update_id")
        )
        result = await self.db.execute(sql_statement, {"update_id": update_id})
        return result.scalar_one_or_none()
    
    async def get_by_submitting_user_id(self, su_id: int) -> Optional[PendingUpdates]:
        sql_statement = select(PendingUpdates).from_statement(
            text("SELECT * FROM pending_updates WHERE submitting_user_id = :su_id")
        )
        result = await self.db.execute(sql_statement, {"su_id": su_id})
        return result.scalars().all()

    async def get_by_pending(self) -> Optional[PendingUpdates]:
        sql_statement = select(PendingUpdates).from_statement(
            text("SELECT * FROM pending_updates WHERE status = 'Pending'")
        )
        result = await self.db.execute(sql_statement)
        return result.scalars().all()

    async def create(self, pu_data: PUCreate) -> PendingUpdates:
        data = pu_data.model_dump()
        sql = select(PendingUpdates).from_statement(
            text("INSERT INTO pending_updates (submit_date, proposed_value, reason, status, submitting_user_id, forest_observation_id) \
                    VALUES (:submit_date, :proposed_value, :reason, :status, :submitting_user_id, :observation_id) \
                    RETURNING *")
        )
        result = await self.db.execute(sql, data)
        pu = result.scalar_one()

        await self.commit()
        await self.refresh(pu)
        return pu

    async def update(self, update_id: int, pu_update: PUUpdate) -> Optional[PendingUpdates]:
        pu = await self.get_by_id(update_id)
        if not pu:
            return None

        update_data = pu_update.model_dump(exclude_unset=True)
        if update_data:
            set_clause = ", ".join([f"{key} = :{key}" for key in update_data.keys()])
            params = {**update_data, "update_id": update_id}
            sql_statement = select(PendingUpdates).from_statement(text(f"""
                                 UPDATE pending_updates
                                 SET {set_clause}
                                 WHERE update_id = :update_id
                                 RETURNING *"""))
            await self.db.execute(sql_statement, params)
            await self.commit()
            await self.refresh(pu)
        return pu
    
    async def approve(self, update_id: int) -> Optional[PendingUpdates]:
        pu = await self.get_by_id(update_id)
        if not pu:
            return None
        
        # Here we would also apply the proposed change to the parent observation if applicable
        # For simplicity, we'll just update the status to 'Approved' and not implement the actual application logic
        sql_statement = select(PendingUpdates).from_statement(text("""
                             UPDATE pending_updates
                             SET status = 'Approved'
                             WHERE update_id = :update_id
                             RETURNING *"""))
        result = await self.db.execute(sql_statement, {"update_id": update_id})
        approved_pu = result.scalar_one_or_none()
        
        await self.commit()
        if approved_pu:
            await self.refresh(approved_pu)
        return approved_pu

    async def delete(self, update_id: int) -> bool:
        pu = await self.get_by_id(update_id)
        if not pu:
            return False
        sql = text("DELETE FROM pending_updates WHERE update_id = :update_id")
        await self.db.execute(sql, {"update_id": update_id})
        await self.commit()
        return True
    
class RCRepository(BaseRepository):
    """
        Async repository for RegionClassification operations
    """

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[RegionClassification]:
        sql_statement = select(RegionClassification).from_statement(
            text("SELECT * FROM region_classifications OFFSET :skip LIMIT :limit")
        )
        result = await self.db.execute(sql_statement, {"skip": skip, "limit": limit})
        return result.scalars().all()
    
    async def get_by_id(self, region_id: int, lct_id) -> Optional[RegionClassification]:
        sql_statement = select(RegionClassification).from_statement(
            text("SELECT * FROM region_classifications WHERE rc_region_id = :region_id AND lct_id = :lct_id")
        )
        result = await self.db.execute(sql_statement, {"region_id": region_id, "lct_id": lct_id})
        return result.scalar_one_or_none()
    
    async def get_by_region_id(self, region_id: int) -> Optional[RegionClassification]:
        sql_statement = select(RegionClassification).from_statement(
            text("SELECT * FROM region_classifications WHERE rc_region_id = :region_id")
        )
        result = await self.db.execute(sql_statement, {"region_id": region_id})
        return result.scalars().all()

    async def get_by_lct_id(self, lct_id: int) -> Optional[RegionClassification]:
        sql_statement = select(RegionClassification).from_statement(
            text("SELECT * FROM region_classifications WHERE lct_id = :lct_id")
        )
        result = await self.db.execute(sql_statement, {"lct_id": lct_id})
        return result.scalars().all()

    async def create(self, rc_data: RCCreate) -> RegionClassification:
        data = rc_data.model_dump()
        sql = select(RegionClassification).from_statement(
            text("INSERT INTO region_classifications (rc_region_id, lct_id) \
                    VALUES (:rc_region_id, :lct_id) \
                    RETURNING *")
        )
        result = await self.db.execute(sql, data)
        rc = result.scalar_one()

        await self.commit()
        await self.refresh(rc)
        return rc

    async def delete(self, region_id: int, lct_id: int) -> bool:
        rc = await self.get_by_id(region_id, lct_id)
        if not rc:
            return False
        sql = text("DELETE FROM region_classifications WHERE rc_region_id = :region_id AND lct_id = :lct_id")
        await self.db.execute(sql, {"region_id": region_id, "lct_id": lct_id})
        await self.commit()
        return True

class StatsRepository(BaseRepository):
    """Repository for computing SQL aggregate statistics."""

    async def get_viewer_stats(self, user_id: int) -> dict:
        """
        Compute aggregate stats for a viewer based on their saved subscriptions.
        Uses: COUNT, SUM, MAX, MIN, AVG
        """
        # 1. COUNT: Total subscriptions
        count_sql = text("SELECT COUNT(*) FROM subscriptions WHERE user_id = :user_id AND active = true")
        count_res = await self.db.execute(count_sql, {"user_id": user_id})
        # Handle count result correctly for sqlalchemy
        result_count = count_res.scalar()
        sub_count = int(result_count) if result_count else 0

        # 2-5: Aggregates across the matching observation data
        # We join subscriptions to forest_observations on region and metric
        agg_sql = text("""
            SELECT 
                SUM(fo.value) as total_value,
                MAX(fo.value) as max_value,
                MIN(fo.value) as min_value,
                AVG(fo.value) as avg_value
            FROM forest_observations fo
            JOIN subscriptions s ON fo.describing_region_id = s.region_id 
                AND fo.observation_metric = s.metric_id
            WHERE s.user_id = :user_id AND s.active = true
        """)
        
        agg_res = await self.db.execute(agg_sql, {"user_id": user_id})
        row = agg_res.fetchone()
        
        return {
            "count": sub_count,
            "sum": round(row.total_value, 2) if row and row.total_value else 0,
            "max": round(row.max_value, 2) if row and row.max_value else 0,
            "min": round(row.min_value, 2) if row and row.min_value else 0,
            "avg": round(row.avg_value, 2) if row and row.avg_value else 0
        }

    async def get_guest_stats(self) -> dict:
        """
        Compute global aggregate stats for guest users.
        Uses: COUNT(DISTINCT), SUM, MAX, MIN, AVG
        """
        # Global Aggregates across all observations
        agg_sql = text("""
            SELECT 
                COUNT(DISTINCT describing_region_id) as region_count,
                SUM(value) as total_value,
                MAX(value) as max_value,
                MIN(value) as min_value,
                AVG(value) as avg_value
            FROM forest_observations
        """)
        
        agg_res = await self.db.execute(agg_sql)
        row = agg_res.fetchone()
        
        return {
            "count": row.region_count if row and row.region_count else 0,
            "sum": round(row.total_value, 2) if row and row.total_value else 0,
            "max": round(row.max_value, 2) if row and row.max_value else 0,
            "min": round(row.min_value, 2) if row and row.min_value else 0,
            "avg": round(row.avg_value, 2) if row and row.avg_value else 0
        }

    async def get_researcher_stats(self, user_id: int) -> dict:
        """
        Compute aggregate stats for a researcher based on their pending submissions.
        Uses: COUNT, SUM, MAX, MIN, AVG
        """
        # Aggregates across the matching pending updates data
        agg_sql = text("""
            SELECT 
                COUNT(update_id) as total_count,
                SUM(proposed_value) as total_value,
                MAX(proposed_value) as max_value,
                MIN(proposed_value) as min_value,
                AVG(proposed_value) as avg_value
            FROM pending_updates
            WHERE submitting_user_id = :user_id
        """)
        
        agg_res = await self.db.execute(agg_sql, {"user_id": user_id})
        row = agg_res.fetchone()
        
        return {
            "count": row.total_count if row and row.total_count else 0,
            "sum": round(row.total_value, 2) if row and row.total_value else 0,
            "max": round(row.max_value, 2) if row and row.max_value else 0,
            "min": round(row.min_value, 2) if row and row.min_value else 0,
            "avg": round(row.avg_value, 2) if row and row.avg_value else 0
        }

    async def get_admin_stats(self) -> dict:
        """
        Compute system-wide aggregate stats for admins.
        Uses: COUNT(users), SUM(obs), MAX(pending), MIN(obs), AVG(pending)
        """
        # User Count
        user_sql = text("SELECT COUNT(*) FROM users")
        user_res = await self.db.execute(user_sql)
        user_count = user_res.scalar() or 0

        # Global Observation Aggregates
        obs_sql = text("SELECT SUM(value) as total_sum, MIN(value) as min_val FROM forest_observations")
        obs_res = await self.db.execute(obs_sql)
        obs_row = obs_res.fetchone()

        # Pending Aggregates
        pending_sql = text("SELECT MAX(proposed_value) as max_pending, AVG(proposed_value) as avg_pending FROM pending_updates")
        pending_res = await self.db.execute(pending_sql)
        pending_row = pending_res.fetchone()

        return {
            "count": user_count,
            "sum": round(obs_row.total_sum, 2) if obs_row and obs_row.total_sum else 0,
            "max": round(pending_row.max_pending, 2) if pending_row and pending_row.max_pending else 0,
            "min": round(obs_row.min_val, 2) if obs_row and obs_row.min_val else 0,
            "avg": round(pending_row.avg_pending, 2) if pending_row and pending_row.avg_pending else 0
        }