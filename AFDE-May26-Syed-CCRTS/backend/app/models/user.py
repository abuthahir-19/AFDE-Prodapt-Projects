from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(20))
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    role = relationship("Role", back_populates="users")
    complaints = relationship("Complaint", foreign_keys="Complaint.customer_id", back_populates="customer")
    assigned_complaints = relationship("Complaint", foreign_keys="Complaint.assigned_agent_id", back_populates="assigned_agent")
    history_entries = relationship("ComplaintHistory", back_populates="updated_by_user")
    feedback = relationship("Feedback", back_populates="customer")
