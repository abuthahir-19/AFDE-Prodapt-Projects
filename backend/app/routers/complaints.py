import os
import shutil
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.complaint import Complaint
from app.models.attachment import Attachment
from app.models.user import User
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate, ComplaintAssign, ComplaintResolve
from app.utils.auth import get_current_user, require_role
from app.services.complaint_service import generate_complaint_number, create_complaint_history
from app.services.sla_service import calculate_sla_deadline

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _fmt(c: Complaint) -> dict:
    return {
        "id": c.id,
        "complaint_number": c.complaint_number,
        "title": c.title,
        "customer_id": c.customer_id,
        "customer_name": c.customer.name if c.customer else None,
        "customer_email": c.customer.email if c.customer else None,
        "category_id": c.category_id,
        "category_name": c.category.name if c.category else None,
        "assigned_agent_id": c.assigned_agent_id,
        "assigned_agent_name": c.assigned_agent.name if c.assigned_agent else None,
        "description": c.description,
        "priority": c.priority,
        "status": c.status,
        "escalation_level": c.escalation_level,
        "sla_deadline": c.sla_deadline,
        "resolved_date": c.resolved_date,
        "created_at": c.created_at,
        "updated_at": c.updated_at,
    }


@router.post("")
def create_complaint(data: ComplaintCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sla_deadline = calculate_sla_deadline(data.priority, datetime.utcnow())
    complaint = Complaint(
        complaint_number=generate_complaint_number(),
        title=data.title,
        customer_id=current_user.id,
        category_id=data.category_id,
        description=data.description,
        priority=data.priority,
        status="Open",
        sla_deadline=sla_deadline,
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    create_complaint_history(db, complaint.id, current_user.id, None, "Open", "Complaint registered")
    return {"message": "Complaint created successfully", "complaint_number": complaint.complaint_number, "id": complaint.id}


@router.get("/escalated")
def get_escalated(db: Session = Depends(get_db), current_user: User = Depends(require_role("Admin", "Supervisor"))):
    complaints = db.query(Complaint).filter(Complaint.status == "Escalated").order_by(Complaint.created_at.desc()).all()
    return [_fmt(c) for c in complaints]


@router.get("")
def list_complaints(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category_id: Optional[int] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Complaint)
    if current_user.role.name == "Customer":
        query = query.filter(Complaint.customer_id == current_user.id)
    elif current_user.role.name == "Support Agent":
        query = query.filter(Complaint.assigned_agent_id == current_user.id)
    if status:
        query = query.filter(Complaint.status == status)
    if priority:
        query = query.filter(Complaint.priority == priority)
    if category_id:
        query = query.filter(Complaint.category_id == category_id)

    total = query.count()
    items = query.order_by(Complaint.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"total": total, "page": page, "page_size": page_size, "data": [_fmt(c) for c in items]}


@router.get("/{complaint_id}")
def get_complaint(complaint_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if current_user.role.name == "Customer" and complaint.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    result = _fmt(complaint)
    result["history"] = [
        {
            "id": h.id,
            "updated_by": h.updated_by,
            "updated_by_name": h.updated_by_user.name if h.updated_by_user else None,
            "old_status": h.old_status,
            "new_status": h.new_status,
            "comment": h.comment,
            "updated_at": h.updated_at,
        }
        for h in complaint.history
    ]
    result["attachments"] = [
        {"id": a.id, "file_name": a.file_name, "uploaded_at": a.uploaded_at}
        for a in complaint.attachments
    ]
    return result


@router.put("/{complaint_id}/assign")
def assign_complaint(
    complaint_id: int,
    data: ComplaintAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "Supervisor")),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    agent = db.query(User).filter(User.id == data.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    old_status = complaint.status
    complaint.assigned_agent_id = data.agent_id
    complaint.status = "Assigned"
    complaint.updated_at = datetime.utcnow()
    db.commit()
    create_complaint_history(db, complaint.id, current_user.id, old_status, "Assigned", f"Assigned to {agent.name}")
    return {"message": f"Complaint assigned to {agent.name}"}


@router.put("/{complaint_id}/status")
def update_status(
    complaint_id: int,
    data: ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if current_user.role.name == "Support Agent" and complaint.assigned_agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    old_status = complaint.status
    if data.status:
        complaint.status = data.status
        if data.status == "Resolved":
            complaint.resolved_date = datetime.utcnow()
    complaint.updated_at = datetime.utcnow()
    db.commit()
    create_complaint_history(db, complaint.id, current_user.id, old_status, complaint.status)
    return {"message": "Status updated"}


@router.put("/{complaint_id}/resolve")
def resolve_complaint(
    complaint_id: int,
    data: ComplaintResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "Support Agent", "Supervisor")),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if current_user.role.name == "Support Agent" and complaint.assigned_agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    old_status = complaint.status
    complaint.status = "Resolved"
    complaint.resolved_date = datetime.utcnow()
    complaint.updated_at = datetime.utcnow()
    db.commit()
    create_complaint_history(db, complaint.id, current_user.id, old_status, "Resolved", data.resolution_comment)
    return {"message": "Complaint resolved successfully"}


@router.put("/{complaint_id}/close")
def close_complaint(complaint_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if complaint.status != "Resolved":
        raise HTTPException(status_code=400, detail="Only resolved complaints can be closed")

    old_status = complaint.status
    complaint.status = "Closed"
    complaint.updated_at = datetime.utcnow()
    db.commit()
    create_complaint_history(db, complaint.id, current_user.id, old_status, "Closed", "Complaint closed by customer")
    return {"message": "Complaint closed"}


@router.post("/{complaint_id}/attachments")
async def upload_attachment(
    complaint_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    dest_dir = os.path.join(UPLOAD_DIR, str(complaint_id))
    os.makedirs(dest_dir, exist_ok=True)
    file_path = os.path.join(dest_dir, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    att = Attachment(
        complaint_id=complaint_id,
        file_name=file.filename,
        file_path=file_path,
        file_size=os.path.getsize(file_path),
    )
    db.add(att)
    db.commit()
    return {"message": "File uploaded", "file_name": file.filename}
