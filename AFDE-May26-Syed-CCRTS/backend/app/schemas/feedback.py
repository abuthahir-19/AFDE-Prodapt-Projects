from pydantic import BaseModel, Field
from typing import Optional


class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None
