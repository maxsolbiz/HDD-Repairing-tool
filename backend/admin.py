# admin.py
import io
import logging
import csv
import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import jwt

from models import UserActivity, UserRoleEnum  # Import UserRoleEnum for proper role comparison
from crud import get_online_users_count, get_user_by_email
from database import get_db
from config import SECRET_KEY, ALGORITHM
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer
from export import generate_csv, generate_pdf, get_export_filename  # Functions defined in export.py

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_current_admin_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except jwt.PyJWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    user = get_user_by_email(db, email)
    # Updated role check: compare enum directly without calling lower()
    if not user or user.role != UserRoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
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
    for activity in activities:
        result.append({
            "id": activity.id,
            "user_email": activity.user.email,
            "login_time": str(activity.login_time) if activity.login_time else "",
            "logout_time": str(activity.logout_time) if activity.logout_time else "",
            "ip_address": activity.ip_address or "",
            "user_agent": activity.user_agent or ""
        })

    return {
        "activities": result,
        "total": total,
        "page": page,
        "per_page": per_page
    }

@admin_router.get("/stats/online", response_model=dict)
def admin_stats(
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    online = get_online_users_count(db)
    return {"online_users": online}

@admin_router.get("/export-activities")
def export_activities(
    format: str = Query("csv", enum=["csv", "pdf"]),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    # Fetch all user activities (or add pagination/filters as needed)
    activities_qs = db.query(UserActivity).order_by(UserActivity.login_time.desc()).all()
    activities = []
    for act in activities_qs:
        activities.append({
            "id": act.id,
            "user_email": act.user.email,
            "login_time": str(act.login_time or ""),
            "logout_time": str(act.logout_time or ""),
            "ip_address": act.ip_address or "",
            "user_agent": act.user_agent or ""
        })

    if format == "csv":
        csv_data = generate_csv(activities)
        response = StreamingResponse(
            iter([csv_data]),
            media_type="text/csv"
        )
        response.headers["Content-Disposition"] = f"attachment; filename={get_export_filename('csv')}"
        return response
    elif format == "pdf":
        pdf_buffer = generate_pdf(activities)
        response = StreamingResponse(
            pdf_buffer,
            media_type="application/pdf"
        )
        response.headers["Content-Disposition"] = f"attachment; filename={get_export_filename('pdf')}"
        return response
