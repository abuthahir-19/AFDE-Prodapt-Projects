import csv
import json
import io
import os
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_roles
from app.models.user import User
from app.models.article import Article
from app.models.category import Category
from app.models.tag import Tag
from app.models.etl_job import ETLJob
from app.schemas.etl import ETLJobResponse, ETLImportResult

router = APIRouter(prefix="/api/etl", tags=["ETL"])

SAMPLE_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "sample_articles.csv")


def _get_or_create_category(db: Session, name: str, user_id: int) -> Category:
    name = name.strip()
    cat = db.query(Category).filter(Category.name == name).first()
    if not cat:
        cat = Category(name=name, created_by=user_id)
        db.add(cat)
        db.flush()
    return cat


def _get_or_create_tag(db: Session, name: str) -> Tag:
    name = name.strip().lower()
    tag = db.query(Tag).filter(Tag.name == name).first()
    if not tag:
        tag = Tag(name=name)
        db.add(tag)
        db.flush()
    return tag


def _process_records(records: list, db: Session, user_id: int) -> tuple[int, int, list]:
    imported = 0
    failed = 0
    errors = []

    for idx, row in enumerate(records, start=1):
        title = (row.get("title") or "").strip()
        content = (row.get("content") or "").strip()

        if not title or not content:
            errors.append(f"Row {idx}: missing required field 'title' or 'content'")
            failed += 1
            continue

        try:
            category = None
            cat_name = (row.get("category") or "").strip()
            if cat_name:
                category = _get_or_create_category(db, cat_name, user_id)

            tags = []
            tags_raw = (row.get("tags") or "").strip()
            if tags_raw:
                for t in tags_raw.split(","):
                    t = t.strip()
                    if t:
                        tags.append(_get_or_create_tag(db, t))

            raw_status = (row.get("status") or "published").strip()
            valid_statuses = {"draft", "published", "pending_approval", "approved", "archived"}
            article_status = raw_status if raw_status in valid_statuses else "published"

            try:
                view_count = int(row.get("views") or 0)
            except (ValueError, TypeError):
                view_count = 0

            article = Article(
                title=title,
                description=(row.get("description") or "").strip() or None,
                content=content,
                status=article_status,
                author_id=user_id,
                category_id=category.id if category else None,
                view_count=view_count,
            )
            article.tags = tags
            db.add(article)
            imported += 1

        except Exception as e:
            errors.append(f"Row {idx}: {str(e)}")
            failed += 1

    return imported, failed, errors


@router.post("/import", response_model=ETLImportResult, status_code=status.HTTP_201_CREATED)
async def import_articles(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    """Upload a CSV or JSON file to bulk-import articles."""
    filename = file.filename or "upload"
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in ("csv", "json"):
        raise HTTPException(status_code=400, detail="Only .csv and .json files are supported")

    raw = await file.read()

    job = ETLJob(
        filename=filename,
        file_type=ext,
        status="processing",
        created_by=current_user.id,
    )
    db.add(job)
    db.flush()

    errors: list[str] = []
    records: list[dict] = []

    try:
        if ext == "csv":
            text = raw.decode("utf-8-sig")
            reader = csv.DictReader(io.StringIO(text))
            records = [dict(row) for row in reader]
        else:
            records = json.loads(raw.decode("utf-8"))
            if not isinstance(records, list):
                raise ValueError("JSON file must contain a top-level array")
    except Exception as e:
        job.status = "failed"
        job.error_details = json.dumps([f"Parse error: {str(e)}"])
        job.completed_at = datetime.utcnow()
        db.commit()
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    job.total_records = len(records)
    imported, failed, errors = _process_records(records, db, current_user.id)

    job.imported_records = imported
    job.failed_records = failed
    job.status = "completed" if failed == 0 else ("failed" if imported == 0 else "completed")
    job.error_details = json.dumps(errors) if errors else None
    job.completed_at = datetime.utcnow()
    db.commit()

    return ETLImportResult(
        job_id=job.id,
        filename=filename,
        status=job.status,
        total_records=len(records),
        imported_records=imported,
        failed_records=failed,
        errors=errors,
    )


@router.get("/jobs", response_model=List[ETLJobResponse])
def list_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    """List all ETL import jobs."""
    return db.query(ETLJob).order_by(ETLJob.created_at.desc()).all()


@router.get("/jobs/{job_id}", response_model=ETLJobResponse)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    """Get details of a specific import job."""
    job = db.query(ETLJob).filter(ETLJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/sample")
def download_sample(current_user: User = Depends(require_roles("admin"))):
    """Download the sample CSV file."""
    path = os.path.abspath(SAMPLE_CSV_PATH)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Sample file not found")
    return FileResponse(path, media_type="text/csv", filename="sample_articles.csv")
