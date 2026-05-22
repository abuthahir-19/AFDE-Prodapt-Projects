from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Date
from datetime import datetime
from database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    ticket_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    issue_category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, nullable=False)
    status = Column(String, default="Open")
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class HistoricalTicket(Base):
    __tablename__ = "historical_tickets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    issue_category = Column(String, nullable=False)
    status = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    created_date = Column(Date, nullable=True)
    resolved_date = Column(Date, nullable=True)
    resolution_days = Column(Float, nullable=True)
