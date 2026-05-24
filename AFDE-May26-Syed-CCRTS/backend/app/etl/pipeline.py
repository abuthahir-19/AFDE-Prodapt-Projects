import time
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from app.models.complaint import Complaint
from app.models.analytics import AnalyticsComplaint, ETLRunLog
from app.services.sla_service import SLA_HOURS  # noqa: F401 — imported for reference; SLA already on complaints


RESOLVED_STATUSES = {"Resolved", "Closed"}


def _strip_tz(dt):
    if dt is None:
        return None
    return dt.replace(tzinfo=None) if dt.tzinfo else dt


def _transform(complaint: Complaint, now: datetime) -> AnalyticsComplaint:
    created = _strip_tz(complaint.created_at)
    resolved = _strip_tz(complaint.resolved_date)
    deadline = _strip_tz(complaint.sla_deadline)

    resolution_time_hours = None
    if resolved and created:
        resolution_time_hours = round((resolved - created).total_seconds() / 3600, 2)

    sla_breached = False
    breach_hours = None
    if deadline:
        if complaint.status in RESOLVED_STATUSES and resolved:
            if resolved > deadline:
                sla_breached = True
                breach_hours = round((resolved - deadline).total_seconds() / 3600, 2)
        elif complaint.status not in RESOLVED_STATUSES:
            if now > deadline:
                sla_breached = True
                breach_hours = round((now - deadline).total_seconds() / 3600, 2)

    return AnalyticsComplaint(
        complaint_id=complaint.id,
        complaint_number=complaint.complaint_number,
        title=complaint.title,
        customer_id=complaint.customer_id,
        customer_name=complaint.customer.name if complaint.customer else None,
        category_id=complaint.category_id,
        category_name=complaint.category.name if complaint.category else None,
        assigned_agent_id=complaint.assigned_agent_id,
        agent_name=complaint.assigned_agent.name if complaint.assigned_agent else None,
        priority=complaint.priority,
        status=complaint.status,
        escalation_level=complaint.escalation_level or 0,
        created_at=created,
        resolved_date=resolved,
        sla_deadline=deadline,
        resolution_time_hours=resolution_time_hours,
        sla_breached=sla_breached,
        breach_hours=breach_hours,
        created_month=created.strftime("%Y-%m") if created else None,
        etl_loaded_at=now,
    )


def run_etl_pipeline(db: Session) -> dict:
    start = time.time()
    now = datetime.utcnow()

    log = ETLRunLog(run_at=now, status="running", records_processed=0)
    db.add(log)
    db.commit()
    db.refresh(log)

    try:
        complaints = (
            db.query(Complaint)
            .options(
                joinedload(Complaint.customer),
                joinedload(Complaint.assigned_agent),
                joinedload(Complaint.category),
            )
            .all()
        )

        rows = [_transform(c, now) for c in complaints]

        db.query(AnalyticsComplaint).delete()
        db.bulk_save_objects(rows)
        db.commit()

        duration = round(time.time() - start, 3)
        log.status = "success"
        log.records_processed = len(rows)
        log.duration_seconds = duration
        db.commit()

        return {"records_processed": len(rows), "duration_seconds": duration, "status": "success"}

    except Exception as exc:
        db.rollback()
        duration = round(time.time() - start, 3)
        log.status = "error"
        log.error_message = str(exc)
        log.duration_seconds = duration
        db.commit()
        raise
