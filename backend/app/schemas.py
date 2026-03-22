from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal
from datetime import date, datetime


# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    acct_type: Literal['Admin', 'Researcher', 'Subscriber', 'Guest']

class UserCreate(UserBase):
    user_id: int
    pw_hash: str
    creation_date: date

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    acct_type: Optional[Literal['Admin', 'Researcher', 'Subscriber', 'Guest']] = None
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
    geo_boundary: Optional[str] = None
    parent_region_id: Optional[int] = None

class RegionUpdate(BaseModel):
    region_name: Optional[str] = None
    region_type: Optional[str] = None
    geo_boundary: Optional[str] = None
    parent_region_id: Optional[int] = None

class RegionResponse(RegionBase):
    region_id: int
    geo_boundary: Optional[str] = None
    parent_region_id: Optional[int] = None
    
    class Config:
        from_attributes = True

# Metric Schemas
class MetricBase(BaseModel):
    metric_name: str
    unit: str
    value_type: Literal['Total', 'PerHectare', 'Percentage', 'Rate']

class MetricCreate(MetricBase):
    description: Optional[str] = None

class MetricUpdate(BaseModel):
    metric_name: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    value_type: Optional[Literal['Total', 'PerHectare', 'Percentage', 'Rate']] = None

class MetricResponse(MetricBase):
    metric_id: int
    description: Optional[str] = None
    
    class Config:
        from_attributes = True


# Subscription Schemas
class SubscriptionBase(BaseModel):
    user_id: int
    metric_id: int
    region_id: int
    active: bool

class SubscriptionCreate(SubscriptionBase):
    threshold_value: Optional[float] = None

class SubscriptionUpdate(BaseModel):
    active: Optional[bool] = None
    threshold_value: Optional[float] = None

class SubscriptionResponse(SubscriptionBase):
    threshold_value: Optional[float] = None
    
    class Config:
        from_attributes = True

# LandCoverType Schemas
class LCTBase(BaseModel):
    type_name: str
    category: str

class LCTCreate(LCTBase):
    description: Optional[str] = None

class LCTUpdate(BaseModel):
    type_name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None

class LCTResponse(LCTBase):
    lct_id: int
    description: Optional[str] = None
    
    class Config:
        from_attributes = True

# ForestObservation Schemas
class FOBase(BaseModel):
    value: float
    source_date: date
    period_id: int
    metric_id: int
    region_id: int

class FOCreate(FOBase):
    pass

class FOUpdate(BaseModel):
    value: Optional[float] = None
    source_date: Optional[date] = None
    period_id: Optional[int] = None
    metric_id: Optional[int] = None
    region_id: Optional[int] = None

class FOResponse(FOBase):
    observation_id: int
    
    class Config:
        from_attributes = True

# TimePeriod Schemas
class TPBase(BaseModel):
    period_name: str
    start_year: int
    end_year: Optional[int] = None

class TPCreate(TPBase):
    pass

class TPUpdate(BaseModel): 
    period_name: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None

class TPResponse(TPBase):
    period_id: int
    
    class Config:
        from_attributes = True

# PendingUpdate Schema
class PUBase(BaseModel):
    submit_date: datetime
    proposed_value: float
    reason: str
    status: Literal['Pending', 'Approved', 'Rejected', 'Withdrawn']
    submitting_user_id: int
    observation_id: Optional[int] = None

class PUCreate(PUBase):
    pass

class PUUpdate(BaseModel):
    proposed_value: Optional[float] = None
    reason: Optional[str] = None
    status: Optional[Literal['Pending', 'Approved', 'Rejected', 'Withdrawn']] = None
    approving_admin_id: Optional[int] = None

class PUResponse(PUBase):
    update_id: int
    approving_admin_id: Optional[int] = None
    
    class Config:
        from_attributes = True

# RegionClassification Schemas

class RegionCreate(RegionBase):
    parent_region_id: Optional[int] = None

class RCBase(BaseModel):
    lct_id: int
    region_id: int

class RCCreate(RCBase):
    pass

class RCResponse(RCBase):
    pass