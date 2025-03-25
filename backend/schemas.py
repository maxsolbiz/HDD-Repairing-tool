# schemas.py
from pydantic import BaseModel, EmailStr
import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserInDB(BaseModel):
    id: int
    email: EmailStr

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class UserActivitySchema(BaseModel):
    id: int
    user_id: int
    login_time: datetime.datetime
    logout_time: datetime.datetime | None = None
    ip_address: str | None = None
    user_agent: str | None = None

    class Config:
        orm_mode = True
