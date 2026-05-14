from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class FeedbackCreate(BaseModel):
    participant_name: str = Field(..., min_length=1, max_length=100)
    program_name: str = Field(..., min_length=1, max_length=200)
    rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None


class FeedbackUpdate(BaseModel):
    participant_name: Optional[str] = Field(None, min_length=1, max_length=100)
    program_name: Optional[str] = Field(None, min_length=1, max_length=200)
    rating: Optional[int] = Field(None, ge=1, le=5)
    comments: Optional[str] = None


class FeedbackResponse(BaseModel):
    feedback_id: int
    participant_name: str
    program_name: str
    rating: int
    comments: Optional[str]
    submitted_at: datetime

    model_config = {"from_attributes": True}
