from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/analytics", tags=["analytics"])


class CategoryData(BaseModel):
    issue_category: str
    ticket_count: int


class TrendData(BaseModel):
    month: str
    avg_days: float


class PriorityData(BaseModel):
    priority: str
    ticket_count: int


class DepartmentData(BaseModel):
    department: str
    ticket_count: int


class SummaryData(BaseModel):
    historical_ticket_count: int


@router.get("/issue-categories", response_model=List[CategoryData])
def get_issue_categories(db: Session = Depends(get_db)):
    result = db.execute(text(
        "SELECT issue_category, COUNT(*) as ticket_count "
        "FROM historical_tickets "
        "GROUP BY issue_category "
        "ORDER BY ticket_count DESC"
    ))
    return [{"issue_category": row[0], "ticket_count": row[1]} for row in result]


@router.get("/resolution-trends", response_model=List[TrendData])
def get_resolution_trends(db: Session = Depends(get_db)):
    result = db.execute(text(
        "SELECT strftime('%Y-%m', created_date) as month, "
        "ROUND(AVG(resolution_days), 1) as avg_days "
        "FROM historical_tickets "
        "WHERE resolution_days IS NOT NULL "
        "AND status IN ('Resolved', 'Closed') "
        "GROUP BY month "
        "ORDER BY month ASC"
    ))
    return [{"month": row[0], "avg_days": row[1]} for row in result]


@router.get("/priority-distribution", response_model=List[PriorityData])
def get_priority_distribution(db: Session = Depends(get_db)):
    result = db.execute(text(
        "SELECT priority, COUNT(*) as ticket_count "
        "FROM historical_tickets "
        "GROUP BY priority "
        "ORDER BY CASE priority "
        "WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 "
        "WHEN 'Medium' THEN 3 WHEN 'Low' THEN 4 ELSE 5 END"
    ))
    return [{"priority": row[0], "ticket_count": row[1]} for row in result]


@router.get("/department-tickets", response_model=List[DepartmentData])
def get_department_tickets(db: Session = Depends(get_db)):
    result = db.execute(text(
        "SELECT department, COUNT(*) as ticket_count "
        "FROM historical_tickets "
        "GROUP BY department "
        "ORDER BY ticket_count DESC"
    ))
    return [{"department": row[0], "ticket_count": row[1]} for row in result]


@router.get("/summary", response_model=SummaryData)
def get_summary(db: Session = Depends(get_db)):
    count = db.execute(text("SELECT COUNT(*) FROM historical_tickets")).scalar()
    return {"historical_ticket_count": count or 0}
