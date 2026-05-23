import os
from typing import Any

import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
from database import get_db

router = APIRouter(prefix="/etl", tags=["ETL Pipeline"])

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")

CSV_FILES = {
    "books":        os.path.join(DATA_DIR, "books.csv"),
    "borrowers":    os.path.join(DATA_DIR, "borrowers.csv"),
    "transactions": os.path.join(DATA_DIR, "transactions.csv"),
}


@router.get("/status")
def etl_status(db: Session = Depends(get_db)) -> dict[str, Any]:
    """
    Returns:
    - Whether each CSV file exists and how many rows it has
    - Current row counts in the database for each entity
    """
    csv_info: dict[str, Any] = {}
    for name, path in CSV_FILES.items():
        if os.path.exists(path):
            try:
                df = pd.read_csv(path)
                csv_info[name] = {"exists": True, "rows": len(df), "path": os.path.basename(path)}
            except Exception as e:
                csv_info[name] = {"exists": True, "rows": None, "error": str(e)}
        else:
            csv_info[name] = {"exists": False, "rows": 0}

    db_counts = {
        "books":        db.query(models.Book).count(),
        "borrowers":    db.query(models.Borrower).count(),
        "transactions": db.query(models.Transaction).count(),
    }

    return {"csv_files": csv_info, "database": db_counts}


@router.post("/run")
def run_etl_pipeline() -> dict[str, Any]:
    """
    Triggers the ETL pipeline:
    Extract → Transform → Load
    Returns a full structured report with per-step logs and a summary.
    """
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    from etl import run_etl
    return run_etl()
