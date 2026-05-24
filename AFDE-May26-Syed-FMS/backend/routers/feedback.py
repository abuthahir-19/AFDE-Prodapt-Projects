from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
import crud
from schemas import FeedbackCreate, FeedbackUpdate, FeedbackResponse

router = APIRouter()


@router.get("/feedback", response_model=List[FeedbackResponse])
def get_all_feedback(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return crud.get_all_feedback(db, skip=skip, limit=limit)


@router.get("/feedback/{feedback_id}", response_model=FeedbackResponse)
def get_feedback(feedback_id: int, db: Session = Depends(get_db)):
    feedback = crud.get_feedback_by_id(db, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return feedback


@router.post("/feedback", response_model=FeedbackResponse, status_code=201)
def create_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    return crud.create_feedback(db, feedback)


@router.put("/feedback/{feedback_id}", response_model=FeedbackResponse)
def update_feedback(
    feedback_id: int, feedback: FeedbackUpdate, db: Session = Depends(get_db)
):
    updated = crud.update_feedback(db, feedback_id, feedback)
    if not updated:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return updated


@router.delete("/feedback/{feedback_id}", status_code=204)
def delete_feedback(feedback_id: int, db: Session = Depends(get_db)):
    if not crud.delete_feedback(db, feedback_id):
        raise HTTPException(status_code=404, detail="Feedback not found")


@router.get("/search", response_model=List[FeedbackResponse])
def search_feedback(
    keyword: Optional[str] = Query(None, description="Search in name, program, comments"),
    rating: Optional[int] = Query(None, ge=1, le=5),
    program_name: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return crud.search_feedback(db, keyword=keyword, rating=rating, program_name=program_name)
