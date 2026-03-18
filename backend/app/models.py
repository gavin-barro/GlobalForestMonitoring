from .database import Base
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, Boolean, Table
from sqlalchemy.orm import relationship

class Metrics(Base):
    __tablename__ = "metrics"

    metric_id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False)
    description = Column(String)
    unit = Column(String(30), nullable=False)
    value_type = Column(String(20), nullable=False)

    # Back populations
    observations = relationship("ForestObservations", back_populates="metric")
    subscriptions = relationship("Subscriptions", back_populates="metric")

class TimePeriods(Base):
    __tablename__ = "time_periods"

    period_id = Column(Integer, primary_key=True)
    period_name = Column(String(100), nullable=False)
    start_year = Column(Integer, nullable=False)
    end_year = Column(Integer)

    # Back populations
    observations = relationship("ForestObservations", back_populates="period")

class LandCoverTypes(Base):
    __tablename__ = "land_cover_types"

    lct_id = Column(Integer, primary_key=True)
    type_name = Column(String(100), nullable=False)
    description = Column(String)
    category = Column(String(50), nullable=False)

    # Back populations
    classifications = relationship("RegionClassification", back_populates="land_cover_type")

class Users(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    pw_hash = Column(String(255), nullable=False)
    acct_type = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False)
    creation_date = Column(Date, nullable=False)
    last_login = Column(DateTime)

    # Relationships
    subscriptions = relationship("Subscriptions", back_populates="user")
    submitted_updates = relationship("PendingUpdates", foreign_keys="[PendingUpdates.submitting_user_id]", back_populates="submitting_user")
    approved_updates = relationship("PendingUpdates", foreign_keys="[PendingUpdates.approving_admin_id]", back_populates="approving_admin")

class Regions(Base):
    __tablename__ = "regions"

    region_id = Column(Integer, primary_key=True)
    region_name = Column(String(150), unique=True, index=True, nullable=False)
    region_type = Column(String(50), nullable=False)
    geo_boundary = Column(String, nullable=True)
    parent_region_id = Column(Integer, ForeignKey("regions.region_id"), nullable=True)

    # Self-referencing backprop
    parent = relationship("Regions", remote_side=[region_id], back_populates="sub_regions")
    sub_regions = relationship("Regions", back_populates="parent")

    # Back populations
    observations = relationship("ForestObservations", back_populates="region")
    subscriptions = relationship("Subscriptions", back_populates="region")
    classifications = relationship("RegionClassification", back_populates="region")

class ForestObservations(Base):
    __tablename__ = "forest_observations"

    observation_id = Column(Integer, primary_key=True)
    value = Column(Float, nullable=False)
    source_date = Column(Date, nullable=False)
    
    period_id = Column(Integer, ForeignKey("time_periods.period_id"), nullable=False)
    metric_id = Column(Integer, ForeignKey("metrics.metric_id"), nullable=False)
    region_id = Column(Integer, ForeignKey("regions.region_id"), nullable=False)

    # Back populations
    period = relationship("TimePeriods", back_populates="observations")
    metric = relationship("Metrics", back_populates="observations")
    region = relationship("Regions", back_populates="observations")
    pending_updates = relationship("PendingUpdates", back_populates="observation")

class Subscriptions(Base):
    __tablename__ = "subscriptions"

    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    metric_id = Column(Integer, ForeignKey("metrics.metric_id"), primary_key=True)
    region_id = Column(Integer, ForeignKey("regions.region_id"), primary_key=True)
    active = Column(Boolean, nullable=False, default=True)
    threshold_value = Column(Float, nullable=True)

    # Back populations
    user = relationship("Users", back_populates="subscriptions")
    metric = relationship("Metrics", back_populates="subscriptions")
    region = relationship("Regions", back_populates="subscriptions")

class RegionClassification(Base):
    __tablename__ = "region_classification"

    lct_id = Column(Integer, ForeignKey("land_cover_types.lct_id"), primary_key=True)
    region_id = Column(Integer, ForeignKey("regions.region_id"), primary_key=True)

    # Back populations
    land_cover_type = relationship("LandCoverTypes", back_populates="classifications")
    region = relationship("Regions", back_populates="classifications")

class PendingUpdates(Base):
    __tablename__ = "pending_updates"

    update_id = Column(Integer, primary_key=True)
    submit_date = Column(DateTime, nullable=False)
    proposed_value = Column(Float, nullable=False)
    reason = Column(String, nullable=False)
    status = Column(String(20), nullable=False)
    
    approving_admin_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    submitting_user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    observation_id = Column(Integer, ForeignKey("forest_observations.observation_id"), nullable=True)

    # Back populations
    approving_admin = relationship("Users", foreign_keys=[approving_admin_id], back_populates="approved_updates")
    submitting_user = relationship("Users", foreign_keys=[submitting_user_id], back_populates="submitted_updates")
    observation = relationship("ForestObservations", back_populates="pending_updates")