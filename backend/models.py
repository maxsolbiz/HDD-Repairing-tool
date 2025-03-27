# models.py
import datetime
import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

# Define an enumeration for user roles
class UserRoleEnum(enum.Enum):
    admin = "admin"
    user = "user"
    guest = "guest"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(150), unique=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    # Use the enum for role; default is set to UserRoleEnum.user
    role = Column(Enum(UserRoleEnum), nullable=False, default=UserRoleEnum.user)
    activities = relationship("UserActivity", back_populates="user", cascade="all, delete")

class UserActivity(Base):
    __tablename__ = "user_activities"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    login_time = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    logout_time = Column(DateTime, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    user = relationship("User", back_populates="activities")
