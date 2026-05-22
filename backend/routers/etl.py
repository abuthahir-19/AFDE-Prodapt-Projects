from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from etl.pipeline import run_pipeline

router = APIRouter(prefix="/etl", tags=["etl"])


@router.post("/upload")
async def upload_and_run_etl(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = run_pipeline(file_bytes, db)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"ETL processing failed: {str(e)}")

    return {
        "status": "success",
        "message": f"ETL completed. {result['rows_loaded']} records loaded into historical_tickets.",
        **result,
    }


@router.get("/status")
def get_etl_status(db: Session = Depends(get_db)):
    count = db.execute(text("SELECT COUNT(*) FROM historical_tickets")).scalar()
    return {"historical_ticket_count": count or 0}
