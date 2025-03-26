import io
import csv
import datetime
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import jwt

from models import UserActivity
from crud import get_online_users_count, get_user_by_email
from database import get_db
from config import SECRET_KEY, ALGORITHM
from fastapi.security import OAuth2PasswordBearer

# Import the export module
from export import create_pdf

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
    current_user=Depends(get_current_admin_user)
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
            "login_time": activity.login_time.strftime("%Y-%m-%d %H:%M:%S") if activity.login_time else "",
            "logout_time": activity.logout_time.strftime("%Y-%m-%d %H:%M:%S") if activity.logout_time else "",
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
    current_user=Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    online = get_online_users_count(db)
    return {"online_users": online}

@admin_router.get("/export-activities", response_class=StreamingResponse)
def export_activities(
    format: str = Query("csv", enum=["csv", "pdf"]),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    activities_query = db.query(UserActivity).order_by(UserActivity.login_time.desc()).all()
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
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["id", "user_email", "login_time", "logout_time", "ip_address", "user_agent"])
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
        response = StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv"
        )
        timestamp = int(datetime.datetime.now().timestamp() * 1000)
        response.headers["Content-Disposition"] = f"attachment; filename=activities_{timestamp}.csv"
        return response

    elif format == "pdf":
        if not create_pdf:
            raise HTTPException(status_code=500, detail="PDF export module not available.")
        pdf_data = create_pdf(rows)
        response = StreamingResponse(
            io.BytesIO(pdf_data),
            media_type="application/pdf"
        )
        timestamp = int(datetime.datetime.now().timestamp() * 1000)
        response.headers["Content-Disposition"] = f"attachment; filename=activities_{timestamp}.pdf"
        return response
