# profile.py
from typing import Optional

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from config import SECRET_KEY, ALGORITHM
from database import get_db
from crud import get_user_by_email
from models import User

# Dependency to extract token and get the current user
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject"
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

# Schema for updating user profile information
from pydantic import BaseModel

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None  # New password; if provided, it will be hashed

# Create the profile router
profile_router = APIRouter()

@profile_router.get("/profile", response_model=dict)
def read_profile(current_user: User = Depends(get_current_user)):
    """
    Retrieve the current user's profile information.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        # For enums, we check if there's a value attribute; otherwise return the field as-is.
        "role": current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    }

@profile_router.patch("/profile", response_model=dict)
def update_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update the current user's profile. Supports updating username and/or password.
    """
    updated = False
    if user_update.username is not None:
        current_user.username = user_update.username
        updated = True
    if user_update.password is not None:
        current_user.hashed_password = pwd_context.hash(user_update.password)
        updated = True
    if updated:
        try:
            db.add(current_user)
            db.commit()
            db.refresh(current_user)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="Profile update failed")
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "role": current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    }
