from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ComplaintCreate(BaseModel):
    title: str
    category_id: int
    description: str
    priority: str = "Medium"


class ComplaintUpdate(BaseModel):
    title: Optional[str] = None
    category_id: Optional[int] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_agent_id: Optional[int] = None


class ComplaintAssign(BaseModel):
    agent_id: int


class ComplaintResolve(BaseModel):
    resolution_comment: str
