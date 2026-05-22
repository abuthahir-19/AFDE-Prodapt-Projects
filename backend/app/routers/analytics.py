from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.database import get_db
from app.models.analytics import AnalyticsComplaint, ETLRunLog
from app.models.user import User
from app.utils.auth import require_role
from app.etl.pipeline import run_etl_pipeline

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

RESOLVED_STATUSES = ("Resolved", "Closed")


@router.get("/sla-report")
def get_sla_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "Supervisor", "Quality Team")),
):
    rows = (
        db.query(
            AnalyticsComplaint.category_name,
            AnalyticsComplaint.priority,
            func.count(AnalyticsComplaint.id).label("total"),
            func.sum(
                case((AnalyticsComplaint.sla_breached == True, 1), else_=0)
            ).label("breached"),
            func.avg(
                case((AnalyticsComplaint.sla_breached == True, AnalyticsComplaint.breach_hours), else_=None)
            ).label("avg_breach_hours"),
        )
        .group_by(AnalyticsComplaint.category_name, AnalyticsComplaint.priority)
        .order_by(AnalyticsComplaint.category_name, AnalyticsComplaint.priority)
        .all()
    )
    return [
        {
            "category": r.category_name,
            "priority": r.priority,
            "total": r.total,
            "breached": r.breached or 0,
            "breach_rate": round((r.breached or 0) / r.total * 100, 2) if r.total else 0,
            "avg_breach_hours": round(r.avg_breach_hours, 2) if r.avg_breach_hours else None,
        }
        for r in rows
    ]


@router.get("/resolution-trends")
def get_resolution_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "Supervisor", "Quality Team")),
):
    rows = (
        db.query(
            AnalyticsComplaint.created_month,
            func.count(AnalyticsComplaint.id).label("total_complaints"),
            func.avg(AnalyticsComplaint.resolution_time_hours).label("avg_resolution_hours"),
            func.sum(
                case((AnalyticsComplaint.sla_breached == True, 1), else_=0)
            ).label("breach_count"),
        )
        .group_by(AnalyticsComplaint.created_month)
        .order_by(AnalyticsComplaint.created_month.asc())
        .all()
    )
    return [
        {
            "month": r.created_month,
            "total_complaints": r.total_complaints,
            "avg_resolution_hours": round(r.avg_resolution_hours, 2) if r.avg_resolution_hours else None,
            "breach_count": r.breach_count or 0,
        }
        for r in rows
    ]


@router.get("/category-analysis")
def get_category_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "Supervisor", "Quality Team")),
):
    rows = (
        db.query(
            AnalyticsComplaint.category_name,
            func.count(AnalyticsComplaint.id).label("total"),
            func.sum(
                case((AnalyticsComplaint.status.in_(RESOLVED_STATUSES), 1), else_=0)
            ).label("resolved"),
            func.sum(
                case((AnalyticsComplaint.sla_breached == True, 1), else_=0)
            ).label("breach_count"),
            func.avg(AnalyticsComplaint.resolution_time_hours).label("avg_resolution_hours"),
        )
        .group_by(AnalyticsComplaint.category_name)
        .order_by(AnalyticsComplaint.category_name)
        .all()
    )
    return [
        {
            "category": r.category_name,
            "total": r.total,
            "resolved": r.resolved or 0,
            "breach_count": r.breach_count or 0,
            "breach_rate": round((r.breach_count or 0) / r.total * 100, 2) if r.total else 0,
            "avg_resolution_hours": round(r.avg_resolution_hours, 2) if r.avg_resolution_hours else None,
        }
        for r in rows
    ]


@router.get("/agent-performance")
def get_agent_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "Supervisor")),
):
    rows = (
        db.query(
            AnalyticsComplaint.agent_name,
            func.count(AnalyticsComplaint.id).label("total_assigned"),
            func.sum(
                case((AnalyticsComplaint.status.in_(RESOLVED_STATUSES), 1), else_=0)
            ).label("resolved"),
            func.sum(
                case((AnalyticsComplaint.sla_breached == True, 1), else_=0)
            ).label("breach_count"),
            func.avg(AnalyticsComplaint.resolution_time_hours).label("avg_resolution_hours"),
        )
        .filter(AnalyticsComplaint.agent_name.isnot(None))
        .group_by(AnalyticsComplaint.agent_name)
        .order_by(AnalyticsComplaint.agent_name)
        .all()
    )
    return [
        {
            "agent_name": r.agent_name,
            "total_assigned": r.total_assigned,
            "resolved": r.resolved or 0,
            "breach_count": r.breach_count or 0,
            "avg_resolution_hours": round(r.avg_resolution_hours, 2) if r.avg_resolution_hours else None,
            "resolution_rate": round((r.resolved or 0) / r.total_assigned * 100, 2) if r.total_assigned else 0,
        }
        for r in rows
    ]


@router.post("/run-etl")
def trigger_etl(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    try:
        result = run_etl_pipeline(db)
        return {"message": "ETL pipeline completed", **result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"ETL failed: {str(exc)}")


@router.get("/etl-status")
def get_etl_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "Supervisor", "Quality Team")),
):
    log = db.query(ETLRunLog).order_by(ETLRunLog.run_at.desc()).first()
    if not log:
        return {"message": "No ETL runs found"}
    return {
        "id": log.id,
        "run_at": log.run_at,
        "status": log.status,
        "records_processed": log.records_processed,
        "duration_seconds": log.duration_seconds,
        "error_message": log.error_message,
    }
