from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class ETLJobResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    status: str
    total_records: int
    imported_records: int
    failed_records: int
    error_details: Optional[str] = None
    created_by: int
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ETLImportResult(BaseModel):
    job_id: int
    filename: str
    status: str
    total_records: int
    imported_records: int
    failed_records: int
    errors: List[str]
