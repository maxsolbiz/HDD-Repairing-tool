import os
import logging
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Use DEBUG level for detailed logs
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# -------------------------
# DATABASE CONFIGURATION
# -------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./users.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

# -------------------------
# DATABASE MODEL
# -------------------------
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

Base.metadata.create_all(bind=engine)

# -------------------------
# SCHEMAS (Pydantic models)
# -------------------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserInDB(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True

# -------------------------
# PASSWORD HASHING UTILS
# -------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# -------------------------
# JWT UTILS
# -------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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

# -------------------------
# CRUD FUNCTIONS
# -------------------------
def get_user_by_email(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    logger.debug(f"get_user_by_email: email={email} found={bool(user)}")
    return user

def create_user(db: Session, user: UserCreate):
    hashed_pw = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_pw)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    logger.debug(f"create_user: Created user {db_user.email} with id {db_user.id}")
    return db_user

# -------------------------
# FASTAPI APPLICATION
# -------------------------
app = FastAPI(title="Hard Drive Diagnostics Auth API")

# Configure CORS middleware to allow your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Hard Drive Diagnostics API!"}

# -------------------------
# AUTHENTICATION ENDPOINTS
# -------------------------
@app.post("/auth/signup", response_model=Token)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Signup attempt for: {user.email}")
    if get_user_by_email(db, user.email):
        logger.warning(f"Signup failed: Email {user.email} already registered.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    new_user = create_user(db, user)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": new_user.email},
        expires_delta=access_token_expires
    )
    logger.info(f"User {new_user.email} signed up successfully.")
    return {"access_token": token, "token_type": "bearer"}

@app.post("/auth/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    logger.info(f"Login attempt for: {form_data.username}")
    user = get_user_by_email(db, form_data.username)
    if not user:
        logger.warning(f"Login failed: User {form_data.username} not found.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    if not verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Login failed: Incorrect password for {form_data.username}.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
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
    if user is None:
        logger.error(f"User not found for email: {email}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    logger.info(f"User {email} fetched successfully via /auth/me")
    return user

@app.get("/drives")
def get_drives():
    logger.info("Fetching drives...")
    return {"drives": ["sda", "sdb", "sdc"]}

@app.on_event("startup")
def seed_default_user():
    db = next(get_db())
    default_email = "admin@example.com"
    default_password = "adminpass"
    if not get_user_by_email(db, default_email):
        logger.info("Seeding default user...")
        create_user(db, UserCreate(email=default_email, password=default_password))
        logger.info(f"Default user created: {default_email} / {default_password}")
    else:
        logger.info("Default user already exists.")
