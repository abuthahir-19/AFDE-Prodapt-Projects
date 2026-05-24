from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class ETLJob(Base):
    __tablename__ = "etl_jobs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # csv | json
    status = Column(String, nullable=False, default="pending")  # pending/processing/completed/failed
    total_records = Column(Integer, default=0)
    imported_records = Column(Integer, default=0)
    failed_records = Column(Integer, default=0)
    error_details = Column(Text, nullable=True)  # JSON string of per-row errors
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    creator = relationship("User", foreign_keys=[created_by])
