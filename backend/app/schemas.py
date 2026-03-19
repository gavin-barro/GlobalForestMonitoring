from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime


# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    acct_type: str

class UserCreate(UserBase):
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


