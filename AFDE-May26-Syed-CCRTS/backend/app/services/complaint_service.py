import random
import string
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.complaint_history import ComplaintHistory


def generate_complaint_number() -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"CMP-{timestamp}-{suffix}"


def create_complaint_history(
    db: Session,
    complaint_id: int,
    updated_by: int,
    old_status: str,
    new_status: str,
    comment: str = None,
):
    history = ComplaintHistory(
        complaint_id=complaint_id,
        updated_by=updated_by,
        old_status=old_status,
        new_status=new_status,
        comment=comment,
    )
    db.add(history)
    db.commit()
    return history


def auto_escalate_breached(db: Session):
    from app.models.complaint import Complaint
    now = datetime.utcnow()
    overdue = (
        db.query(Complaint)
        .filter(
            Complaint.status.not_in(["Resolved", "Closed"]),
            Complaint.sla_deadline < now,
            Complaint.status != "Escalated",
        )
        .all()
    )
    for complaint in overdue:
        old_status = complaint.status
        complaint.status = "Escalated"
        complaint.escalation_level += 1
        complaint.updated_at = now
        create_complaint_history(
            db, complaint.id, complaint.customer_id,
            old_status, "Escalated", "Auto-escalated due to SLA breach"
        )
    db.commit()
    return len(overdue)
