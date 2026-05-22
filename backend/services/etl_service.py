import pandas as pd
from io import BytesIO
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from models import Feedback, ETLJob


COLUMN_ALIASES = {
    "name": "participant_name",
    "participant": "participant_name",
    "program": "program_name",
    "event": "program_name",
    "course": "program_name",
    "score": "rating",
    "stars": "rating",
    "comment": "comments",
    "feedback": "comments",
    "review": "comments",
    "date": "submitted_at",
    "submitted_date": "submitted_at",
    "submission_date": "submitted_at",
    "created_at": "submitted_at",
}


def _read_file(file_bytes: bytes, filename: str) -> pd.DataFrame:
    name_lower = filename.lower()
    if name_lower.endswith(".csv"):
        return pd.read_csv(BytesIO(file_bytes))
    if name_lower.endswith((".xlsx", ".xls")):
        return pd.read_excel(BytesIO(file_bytes))
    raise ValueError(f"Unsupported file type: {filename}. Use .csv or .xlsx")


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]
    return df.rename(columns=COLUMN_ALIASES)


def _validate_required_columns(df: pd.DataFrame):
    required = {"participant_name", "program_name", "rating"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(
            f"Missing required columns: {sorted(missing)}. "
            f"Found: {sorted(df.columns.tolist())}"
        )


def _transform(df: pd.DataFrame) -> tuple[pd.DataFrame, int, int]:
    df = df.copy()

    # Standardize text fields
    df["participant_name"] = df["participant_name"].astype(str).str.strip().str.title()
    df["program_name"] = df["program_name"].astype(str).str.strip().str.title()

    if "comments" not in df.columns:
        df["comments"] = None
    else:
        df["comments"] = df["comments"].astype(str).str.strip()
        df["comments"] = df["comments"].where(
            ~df["comments"].isin(["nan", "none", "None", "NaN", ""]), other=None
        )

    # Convert rating to numeric, coerce non-numeric to NaN
    df["rating"] = pd.to_numeric(df["rating"], errors="coerce")

    # Remove invalid ratings
    invalid_mask = ~df["rating"].between(1, 5)
    invalid_count = int(invalid_mask.sum())
    df = df[~invalid_mask].copy()
    df["rating"] = df["rating"].astype(int)

    # Remove duplicates on key columns
    before = len(df)
    df = df.drop_duplicates(subset=["participant_name", "program_name", "rating"], keep="first")
    duplicate_count = before - len(df)

    # Handle submitted_at
    if "submitted_at" in df.columns:
        df["submitted_at"] = pd.to_datetime(df["submitted_at"], errors="coerce")
        df["submitted_at"] = df["submitted_at"].where(
            df["submitted_at"].notna(),
            other=pd.Timestamp(datetime.now(timezone.utc)),
        )
    else:
        df["submitted_at"] = pd.Timestamp(datetime.now(timezone.utc))

    return df, invalid_count, duplicate_count


def run_etl(file_bytes: bytes, filename: str, db: Session) -> dict:
    error_message = None
    job = ETLJob(filename=filename, status="running")
    db.add(job)
    db.commit()
    db.refresh(job)

    try:
        df = _read_file(file_bytes, filename)
        total_records = len(df)

        df = _normalize_columns(df)
        _validate_required_columns(df)

        df, invalid_count, duplicate_count = _transform(df)
        valid_count = len(df)

        # Load into feedback table
        records = [
            Feedback(
                participant_name=row["participant_name"],
                program_name=row["program_name"],
                rating=int(row["rating"]),
                comments=row["comments"] if pd.notna(row.get("comments")) else None,
                submitted_at=row["submitted_at"].to_pydatetime()
                if hasattr(row["submitted_at"], "to_pydatetime")
                else row["submitted_at"],
            )
            for _, row in df.iterrows()
        ]
        db.bulk_save_objects(records)

        job.status = "completed"
        job.total_records = total_records
        job.valid_records = valid_count
        job.invalid_records = invalid_count
        job.duplicate_records = duplicate_count
        job.imported_records = len(records)
        job.completed_at = datetime.now(timezone.utc)
        db.commit()

    except Exception as exc:
        error_message = str(exc)
        job.status = "failed"
        job.error_message = error_message
        job.completed_at = datetime.now(timezone.utc)
        db.commit()
        raise

    return {
        "job_id": job.job_id,
        "filename": filename,
        "status": job.status,
        "total_records": job.total_records,
        "valid_records": job.valid_records,
        "invalid_records": job.invalid_records,
        "duplicate_records": job.duplicate_records,
        "imported_records": job.imported_records,
    }
