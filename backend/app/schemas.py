from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime


# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    acct_type: str

class UserCreate(UserBase):
    user_id: int
    pw_hash: str
    creation_date: date

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    acct_type: Optional[str] = None
    pw_hash: Optional[str] = None
    last_login: Optional[datetime] = None

class UserResponse(UserBase):
    user_id: int
    creation_date: date
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


# Region Schemas
class RegionBase(BaseModel):
    region_name: str
    region_type: str

class RegionCreate(RegionBase):
    region_id: int
    parent_region_id: Optional[int]
    sub_region_ids: Optional[List[int]]

class RegionUpdate(BaseModel):
    region_name: Optional[str] = None
    region_type: Optional[str] = None
    parent_region_id: Optional[int] = None
    sub_region_ids: Optional[List[int]] = None

class RegionResponse(RegionBase):
    region_id: int
    parent_region_id: int
    sub_region_ids: List[int]

# Metric Schemas
class MetricBase(BaseModel):
    metric_name: str
    unit: str
    value_type: str

class MetricCreate(MetricBase):
    metric_id: int
    metric_description: Optional[str]

class MetricUpdate(BaseModel):
    metric_name: Optional[str] = None
    metric_description: Optional[str] = None
    metric_unit: Optional[str] = None
    metric_value_type: Optional[str] = None

class MetricResponse(MetricBase):
    metric_description: Optional[str]


# Subscription Schemas
class SubscriptionBase(BaseModel):
    user_id: int
    metric_id: int
    region_id: int
    subscription_active: bool

class SubscriptionCreate(SubscriptionBase):
    threshold_value: Optional[float]

class SubscriptionUpdate(BaseModel):
    active: Optional[bool] = None
    threshold_value: Optional[float] = None

class SubscriptionResponse(SubscriptionBase):
    threshold_value: Optional[float]

# LandCoverType Schemas
class LCTBase(BaseModel):
    lct_type_name: str
    lct_category: str

class LCTCreate(LCTBase):
    lct_id: int
    lct_description: Optional[str]

class LCTUpdate(BaseModel):
    lct_type_name: Optional[str] = None
    lct_category: Optional[str] = None
    lct_description: Optional[str] = None

class LCTResponse(LCTBase):
    lct_description: Optional[str]

# ForestObservation Schemas
class FOBase(BaseModel):
    fo_observation_id: int
    fo_value: float
    fo_source_date: date
    fo_period_id: int
    fo_metric_id: int
    fo_region_id: int

class FOCreate(FOBase):
    pass

class FOUpdate(BaseModel):
    fo_observation_id: Optional[int]
    fo_value: Optional[float]
    fo_source_date: Optional[date]
    fo_period_id: Optional[int]
    fo_metric_id: Optional[int]
    fo_region_id: Optional[int]

class FOResponse(FOBase):
    fo_pending_updates = Optional[List[int]]

# TimePeriod Schemas
class TPBase(BaseModel):
    period_id: int 
    period_name: str
    start_date: date
    end_date: Optional[date]

class TPCreate(TPBase):
    pass

class TPUpdate(BaseModel): 
    period_name: Optional[str] = None

class TPResponse(TPBase):
    pass

# PendingUpdate Schema

class PUBase(BaseModel):
    submit_date: date
    proposed_val: float
    reason: str
    status: str
    submitting_user_id: int
    FO_id: Optional[int]

class PUCreate(PUBase):
    update_id: int

class PUUpdate(BaseModel):
    proposed_val: Optional[float] = None
    reason: Optional[str] = None
    status: Optional[str] = None
    approving_admin_id: Optional[int] = None

class PUResponse(PUBase):
    update_id: int
    approving_admin_id: Optional[int]

# RegionClassification Schemas
class RCBase(BaseModel):
    lct_id: int
    region_id: int

class RCCreate(RCBase):
    pass

class RCResponse(RCBase):
    pass