from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(25), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    assigned_agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    description = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False, default="Medium")
    status = Column(String(50), nullable=False, default="Open")
    escalation_level = Column(Integer, default=0)
    sla_deadline = Column(DateTime(timezone=True), nullable=True)
    resolved_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("User", foreign_keys=[customer_id], back_populates="complaints")
    assigned_agent = relationship("User", foreign_keys=[assigned_agent_id], back_populates="assigned_complaints")
    category = relationship("Category", back_populates="complaints")
    history = relationship("ComplaintHistory", back_populates="complaint", order_by="ComplaintHistory.updated_at")
    attachments = relationship("Attachment", back_populates="complaint")
    feedback = relationship("Feedback", back_populates="complaint", uselist=False)
