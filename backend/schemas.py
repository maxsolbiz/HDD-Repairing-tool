# schemas.py
from pydantic import BaseModel, EmailStr
from enum import Enum
import datetime

# Define an enum for user roles in the API layer
class UserRoleEnum(str, Enum):
    admin = "admin"
    user = "user"
    guest = "guest"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str | None = None  # Optional username field
    role: UserRoleEnum = UserRoleEnum.user  # Default role is "user"

class UserInDB(BaseModel):
    id: int
    email: EmailStr
    username: str | None = None  # Include username in response
    role: UserRoleEnum

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
