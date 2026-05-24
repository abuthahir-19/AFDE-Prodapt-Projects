from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.complaint import Complaint
from app.models.feedback import Feedback
from app.models.user import User
from app.schemas.feedback import FeedbackCreate
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])


@router.post("/{complaint_id}")
def submit_feedback(
    complaint_id: int,
    data: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if complaint.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if complaint.status not in ["Resolved", "Closed"]:
        raise HTTPException(status_code=400, detail="Feedback only allowed for resolved complaints")
    if db.query(Feedback).filter(Feedback.complaint_id == complaint_id).first():
        raise HTTPException(status_code=400, detail="Feedback already submitted")

    fb = Feedback(complaint_id=complaint_id, customer_id=current_user.id, rating=data.rating, comments=data.comments)
    db.add(fb)
    db.commit()
    return {"message": "Feedback submitted. Thank you!"}


@router.get("/{complaint_id}")
def get_feedback(complaint_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fb = db.query(Feedback).filter(Feedback.complaint_id == complaint_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="No feedback found")
    return {"id": fb.id, "complaint_id": fb.complaint_id, "rating": fb.rating, "comments": fb.comments, "created_at": fb.created_at}
