# admin.py
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import jwt

from models import UserActivity
from crud import get_online_users_count, get_user_by_email
from database import get_db
from config import SECRET_KEY, ALGORITHM
from fastapi.security import OAuth2PasswordBearer
from export import export_activities_csv, export_activities_pdf  # Import the export functions

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_current_admin_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except jwt.PyJWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = get_user_by_email(db, email)
    if not user or (hasattr(user, "role") and user.role.lower() != "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return user

admin_router = APIRouter()

@admin_router.get("/user-activities", response_model=dict)
def get_user_activities(
    page: int = Query(1, gt=0),
    per_page: int = Query(10, gt=0),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    query = db.query(UserActivity).order_by(UserActivity.login_time.desc())
    total = query.count()
    offset = (page - 1) * per_page
    activities = query.offset(offset).limit(per_page).all()

    result = []
    for act in activities:
        result.append({
            "id": act.id,
            "user_email": act.user.email,
            "login_time": act.login_time,
            "logout_time": act.logout_time,
            "ip_address": act.ip_address,
            "user_agent": act.user_agent
        })

    return {
        "activities": result,
        "total": total,
        "page": page,
        "per_page": per_page
    }

@admin_router.get("/stats/online", response_model=dict)
def admin_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    online = get_online_users_count(db)
    return {"online_users": online}

@admin_router.get("/export-activities")
def export_activities(
    format: str = Query("csv", enum=["csv", "pdf"]),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    # Fetch all user activities (you may add pagination/filters as needed)
    activities_query = db.query(UserActivity).order_by(UserActivity.login_time.desc()).all()
    # Convert query results into a list of dicts
    rows = []
    for act in activities_query:
        rows.append({
            "id": act.id,
            "user_email": act.user.email,
            "login_time": act.login_time.strftime("%Y-%m-%d %H:%M:%S") if act.login_time else "",
            "logout_time": act.logout_time.strftime("%Y-%m-%d %H:%M:%S") if act.logout_time else "",
            "ip_address": act.ip_address or "",
            "user_agent": act.user_agent or ""
        })
    if format == "csv":
        return export_activities_csv(rows)
    elif format == "pdf":
        return export_activities_pdf(rows)
