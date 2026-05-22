from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


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


# ETL Schemas

class ETLJobResponse(BaseModel):
    job_id: int
    filename: str
    status: str
    total_records: int
    valid_records: int
    invalid_records: int
    duplicate_records: int
    imported_records: int
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class ETLResult(BaseModel):
    job_id: int
    filename: str
    status: str
    total_records: int
    valid_records: int
    invalid_records: int
    duplicate_records: int
    imported_records: int


# Analytics Schemas

class RatingDistribution(BaseModel):
    rating: int
    count: int


class ProgramStats(BaseModel):
    program_name: str
    total_count: int
    average_rating: float
    rating_distribution: List[RatingDistribution]


class AnalyticsSummary(BaseModel):
    total_feedback: int
    average_rating: float
    total_programs: int
    rating_distribution: List[RatingDistribution]
    top_rated_program: Optional[str]
    top_rated_program_avg: Optional[float]
    most_feedback_program: Optional[str]
    most_feedback_count: Optional[int]
