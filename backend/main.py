import os
import logging
from dotenv import load_dotenv
load_dotenv()  # load environment variables if not already loaded in config.py

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import jwt

# SQLAlchemy setup
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# Import models, schemas, CRUD functions, admin router, and profile router
from models import Base, User, UserRoleEnum
from schemas import UserCreate, Token, UserInDB
from crud import (
    get_user_by_email,
    create_user,
    create_user_activity,
    update_user_activity_logout,
    get_online_users_count,
    verify_password
)
from admin import admin_router  # Admin routes
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, DATABASE_URL

from profile import profile_router  # User profile routes

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# -------------------------
# DATABASE CONFIGURATION
# -------------------------
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
# Create tables if they do not exist
Base.metadata.create_all(bind=engine)

# -------------------------
# JWT UTILS
# -------------------------
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# -------------------------
# DEPENDENCY: DB SESSION
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

app = FastAPI(title="Hard Drive Diagnostics Auth API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# ROLE MANAGEMENT DEPENDENCY
# -------------------------
def get_current_admin_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = get_user_by_email(db, email)
    # Updated: Compare enum directly instead of calling lower()
    if not user or user.role != UserRoleEnum.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return user

# -------------------------
# STARTUP EVENT: Seed default admin user
# -------------------------
@app.on_event("startup")
def startup():
    db = next(get_db())
    default_email = "admin@example.com"
    default_password = "adminpass"
    user = get_user_by_email(db, default_email)
    if not user:
        logger.info("Seeding default admin user...")
        # Create admin user with username and role
        create_user(db, default_email, default_password, username="admin", role="admin")
        logger.info(f"Default admin user created: {default_email} / {default_password}")
    else:
        logger.info("Default admin user already exists.")

# -------------------------
# AUTHENTICATION ENDPOINTS
# -------------------------
@app.post("/auth/signup", response_model=Token)
def signup(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    logger.info(f"Signup attempt for: {user.email}")
    if get_user_by_email(db, user.email):
        logger.warning(f"Signup failed: Email {user.email} already registered.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    # Pass username and role from the request (assumes your UserCreate schema includes these optional fields)
    new_user = create_user(db, user.email, user.password, user.username, user.role)
    create_user_activity(
        db,
        new_user.id,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(data={"sub": new_user.email}, expires_delta=access_token_expires)
    logger.info(f"User {new_user.email} signed up successfully.")
    return {"access_token": token, "token_type": "bearer"}

@app.post("/auth/token", response_model=Token)
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    logger.info(f"Login attempt for: {form_data.username}")
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Login failed for {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    create_user_activity(
        db,
        user.id,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    logger.info(f"User {user.email} logged in successfully.")
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserInDB)
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            logger.error("Token payload missing email")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except jwt.PyJWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = get_user_by_email(db, email)
    if not user:
        logger.error(f"User not found for email: {email}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    logger.info(f"User {email} fetched successfully via /auth/me")
    return user

@app.post("/auth/logout")
def logout(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            logger.error("Token payload missing email")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except jwt.PyJWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = get_user_by_email(db, email)
    if not user:
        logger.error(f"User not found for email: {email}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    update_user_activity_logout(db, user.id)
    logger.info(f"User {email} logged out successfully.")
    return {"detail": "Logged out successfully"}

@app.get("/drives")
def get_drives():
    logger.info("Fetching drives...")
    return {"drives": ["sda", "sdb", "sdc"]}

@app.get("/stats/online")
def online_users(db: Session = Depends(get_db)):
    count = get_online_users_count(db)
    return {"online_users": count}

# -------------------------
# INCLUDE ADMIN ROUTES
# -------------------------
app.include_router(admin_router, prefix="/admin", tags=["admin"])

# -------------------------
# INCLUDE PROFILE ROUTES
# -------------------------
app.include_router(profile_router, prefix="/user", tags=["Profile"])
