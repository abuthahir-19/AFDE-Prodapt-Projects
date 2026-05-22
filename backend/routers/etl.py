import csv
from collections import defaultdict
from datetime import datetime, timezone
from io import StringIO
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from models import ETLJob, Feedback
from schemas import AnalyticsSummary, ETLJobResponse, ETLResult, ProgramStats, RatingDistribution
from services.etl_service import run_etl

router = APIRouter()

ALLOWED_TYPES = {
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",
}


# ── ETL Endpoints ────────────────────────────────────────────────────────────

@router.post("/etl/upload", response_model=ETLResult, status_code=201, tags=["ETL"])
async def upload_and_run_etl(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    filename = file.filename or ""
    if not filename.lower().endswith((".csv", ".xlsx", ".xls")):
        raise HTTPException(
            status_code=400,
            detail="Only .csv and .xlsx/.xls files are supported.",
        )

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = run_etl(file_bytes, filename, db)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"ETL processing failed: {exc}")

    return result


@router.get("/etl/jobs", response_model=List[ETLJobResponse], tags=["ETL"])
def list_etl_jobs(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return (
        db.query(ETLJob)
        .order_by(ETLJob.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/etl/jobs/{job_id}", response_model=ETLJobResponse, tags=["ETL"])
def get_etl_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(ETLJob).filter(ETLJob.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"ETL job {job_id} not found.")
    return job


# ── Analytics Endpoints ──────────────────────────────────────────────────────

def _build_rating_dist(ratings: list[int]) -> List[RatingDistribution]:
    counts = defaultdict(int)
    for r in ratings:
        counts[r] += 1
    return [RatingDistribution(rating=i, count=counts.get(i, 0)) for i in range(1, 6)]


@router.get("/analytics/summary", response_model=AnalyticsSummary, tags=["Analytics"])
def get_analytics_summary(db: Session = Depends(get_db)):
    rows = db.query(Feedback).all()
    if not rows:
        return AnalyticsSummary(
            total_feedback=0,
            average_rating=0.0,
            total_programs=0,
            rating_distribution=[RatingDistribution(rating=i, count=0) for i in range(1, 6)],
            top_rated_program=None,
            top_rated_program_avg=None,
            most_feedback_program=None,
            most_feedback_count=None,
        )

    ratings = [f.rating for f in rows]
    program_ratings: dict[str, list[int]] = defaultdict(list)
    for f in rows:
        program_ratings[f.program_name].append(f.rating)

    program_avgs = {p: sum(r) / len(r) for p, r in program_ratings.items()}
    top_program = max(program_avgs, key=program_avgs.get)
    most_feedback = max(program_ratings, key=lambda p: len(program_ratings[p]))

    return AnalyticsSummary(
        total_feedback=len(rows),
        average_rating=round(sum(ratings) / len(ratings), 2),
        total_programs=len(program_ratings),
        rating_distribution=_build_rating_dist(ratings),
        top_rated_program=top_program,
        top_rated_program_avg=round(program_avgs[top_program], 2),
        most_feedback_program=most_feedback,
        most_feedback_count=len(program_ratings[most_feedback]),
    )


@router.get("/analytics/programs", response_model=List[ProgramStats], tags=["Analytics"])
def get_program_analytics(db: Session = Depends(get_db)):
    rows = db.query(Feedback).all()
    program_ratings: dict[str, list[int]] = defaultdict(list)
    for f in rows:
        program_ratings[f.program_name].append(f.rating)

    result = []
    for program, ratings in sorted(program_ratings.items()):
        result.append(
            ProgramStats(
                program_name=program,
                total_count=len(ratings),
                average_rating=round(sum(ratings) / len(ratings), 2),
                rating_distribution=_build_rating_dist(ratings),
            )
        )

    return sorted(result, key=lambda x: x.average_rating, reverse=True)


# ── Reports Endpoints ────────────────────────────────────────────────────────

@router.get("/reports/download", tags=["Reports"])
def download_feedback_report(
    program_name: str = None,
    rating: int = None,
    db: Session = Depends(get_db),
):
    query = db.query(Feedback)
    if program_name:
        query = query.filter(Feedback.program_name.ilike(f"%{program_name}%"))
    if rating is not None:
        if rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
        query = query.filter(Feedback.rating == rating)

    rows = query.order_by(Feedback.submitted_at.desc()).all()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Participant Name", "Program Name", "Rating", "Comments", "Submitted At"])
    for f in rows:
        writer.writerow([
            f.feedback_id,
            f.participant_name,
            f.program_name,
            f.rating,
            f.comments or "",
            f.submitted_at.strftime("%Y-%m-%d %H:%M:%S") if f.submitted_at else "",
        ])

    output.seek(0)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"feedback_report_{timestamp}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
