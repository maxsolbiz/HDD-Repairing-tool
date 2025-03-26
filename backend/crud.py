# crud.py
import datetime
from sqlalchemy.orm import Session
from models import User, UserActivity
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, email: str, password: str, username: str = None, role: str = "user"):
    hashed_pw = get_password_hash(password)
    db_user = User(email=email, hashed_password=hashed_pw, username=username, role=role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_user_activity(db: Session, user_id: int, ip_address: str = None, user_agent: str = None):
    activity = UserActivity(
        user_id=user_id,
        login_time=datetime.datetime.utcnow(),
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

def update_user_activity_logout(db: Session, user_id: int):
    activity = db.query(UserActivity).filter(
        UserActivity.user_id == user_id,
        UserActivity.logout_time.is_(None)
    ).order_by(UserActivity.login_time.desc()).first()
    if activity:
        activity.logout_time = datetime.datetime.utcnow()
        db.commit()
    return activity

def get_online_users_count(db: Session):
    return db.query(UserActivity).filter(UserActivity.logout_time.is_(None)).count()
