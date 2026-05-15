from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.complaint import Complaint
from app.models.feedback import Feedback
from app.models.user import User
from app.utils.auth import get_current_user, require_role

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Complaint)
    if current_user.role.name == "Customer":
        query = query.filter(Complaint.customer_id == current_user.id)
    elif current_user.role.name == "Support Agent":
        query = query.filter(Complaint.assigned_agent_id == current_user.id)

    now = datetime.utcnow()
    total = query.count()
    open_c = query.filter(Complaint.status == "Open").count()
    assigned_c = query.filter(Complaint.status == "Assigned").count()
    in_progress = query.filter(Complaint.status == "In Progress").count()
    escalated = query.filter(Complaint.status == "Escalated").count()
    resolved = query.filter(Complaint.status == "Resolved").count()
    closed = query.filter(Complaint.status == "Closed").count()
    sla_breaches = query.filter(Complaint.sla_deadline < now, Complaint.status.not_in(["Resolved", "Closed"])).count()

    resolved_items = db.query(Complaint).filter(Complaint.resolved_date.isnot(None)).all()
    avg_hours = None
    if resolved_items:
        total_hours = sum(
            (c.resolved_date.replace(tzinfo=None) - c.created_at.replace(tzinfo=None)).total_seconds() / 3600
            for c in resolved_items
            if c.resolved_date and c.created_at
        )
        avg_hours = round(total_hours / len(resolved_items), 2)

    return {
        "total": total, "open": open_c, "assigned": assigned_c,
        "in_progress": in_progress, "escalated": escalated,
        "resolved": resolved, "closed": closed,
        "sla_breaches": sla_breaches, "avg_resolution_hours": avg_hours,
    }


@router.get("/trends")
def get_trends(db: Session = Depends(get_db), current_user: User = Depends(require_role("Admin", "Supervisor", "Quality Team"))):
    now = datetime.utcnow()
    result = []
    for i in range(5, -1, -1):
        start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if start.month == 12:
            end = start.replace(year=start.year + 1, month=1)
        else:
            end = start.replace(month=start.month + 1)
        count = db.query(Complaint).filter(Complaint.created_at >= start, Complaint.created_at < end).count()
        result.append({"month": start.strftime("%b %Y"), "count": count})
    return result


@router.get("/category-stats")
def get_category_stats(db: Session = Depends(get_db), current_user: User = Depends(require_role("Admin", "Supervisor", "Quality Team"))):
    from app.models.category import Category
    rows = (
        db.query(Category.name, func.count(Complaint.id).label("count"))
        .outerjoin(Complaint, Complaint.category_id == Category.id)
        .group_by(Category.name)
        .all()
    )
    return [{"category": r.name, "count": r.count} for r in rows]


@router.get("/agent-performance")
def get_agent_performance(db: Session = Depends(get_db), current_user: User = Depends(require_role("Admin", "Supervisor"))):
    from app.models.role import Role
    agent_role = db.query(Role).filter(Role.name == "Support Agent").first()
    if not agent_role:
        return []
    agents = db.query(User).filter(User.role_id == agent_role.id).all()
    perf = []
    for agent in agents:
        total = db.query(Complaint).filter(Complaint.assigned_agent_id == agent.id).count()
        resolved = db.query(Complaint).filter(
            Complaint.assigned_agent_id == agent.id, Complaint.status.in_(["Resolved", "Closed"])
        ).count()
        perf.append({
            "agent_id": agent.id,
            "agent_name": agent.name,
            "total_assigned": total,
            "resolved": resolved,
            "resolution_rate": round((resolved / total * 100) if total > 0 else 0, 2),
        })
    return perf
