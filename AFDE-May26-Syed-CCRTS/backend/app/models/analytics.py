from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class AnalyticsComplaint(Base):
    __tablename__ = "analytics_complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, unique=True, index=True, nullable=False)
    complaint_number = Column(String(25))
    title = Column(String(255))
    customer_id = Column(Integer)
    customer_name = Column(String(100))
    category_id = Column(Integer)
    category_name = Column(String(100))
    assigned_agent_id = Column(Integer, nullable=True)
    agent_name = Column(String(100), nullable=True)
    priority = Column(String(20))
    status = Column(String(50))
    escalation_level = Column(Integer)
    created_at = Column(DateTime)
    resolved_date = Column(DateTime, nullable=True)
    sla_deadline = Column(DateTime, nullable=True)
    resolution_time_hours = Column(Float, nullable=True)
    sla_breached = Column(Boolean, default=False)
    breach_hours = Column(Float, nullable=True)
    created_month = Column(String(7))
    etl_loaded_at = Column(DateTime, default=func.now())


class ETLRunLog(Base):
    __tablename__ = "etl_run_log"

    id = Column(Integer, primary_key=True, index=True)
    run_at = Column(DateTime, nullable=False)
    status = Column(String(20), nullable=False)
    records_processed = Column(Integer, default=0)
    duration_seconds = Column(Float)
    error_message = Column(Text, nullable=True)
