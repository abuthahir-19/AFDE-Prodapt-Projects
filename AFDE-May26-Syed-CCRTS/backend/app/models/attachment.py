from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    complaint = relationship("Complaint", back_populates="attachments")
