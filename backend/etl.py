"""
ETL Pipeline for Library Management System — Phase 2
Can be run standalone: cd backend && python etl.py
Or triggered via the API: POST /etl/run
"""
import os
import sys
from datetime import datetime, timedelta
from typing import Any

import pandas as pd
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.dirname(__file__))
from database import SessionLocal, engine
import models

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
BOOKS_CSV        = os.path.join(DATA_DIR, "books.csv")
BORROWERS_CSV    = os.path.join(DATA_DIR, "borrowers.csv")
TRANSACTIONS_CSV = os.path.join(DATA_DIR, "transactions.csv")


# ── EXTRACT ───────────────────────────────────────────────────────────────────

def extract(filepath: str) -> tuple[pd.DataFrame, dict]:
    df = pd.read_csv(filepath)
    log = {
        "phase": "extract",
        "entity": os.path.splitext(os.path.basename(filepath))[0],
        "rows": len(df),
        "columns": list(df.columns),
        "message": f"Extracted {len(df)} rows from {os.path.basename(filepath)}",
    }
    return df, log


# ── TRANSFORM ─────────────────────────────────────────────────────────────────

def transform_books(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    before = len(df)
    df = df.drop_duplicates(subset=["isbn"])
    df = df.dropna(subset=["title", "author", "category", "isbn"])
    df["availability_status"] = df["availability_status"].fillna("available")
    df["availability_status"] = df["availability_status"].str.strip().str.lower()
    removed = before - len(df)
    return df, {
        "phase": "transform",
        "entity": "books",
        "rows_before": before,
        "rows_after": len(df),
        "rows_removed": removed,
        "message": f"books: {before} → {len(df)} rows ({removed} dirty rows removed — duplicates & nulls)",
    }


def transform_borrowers(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    before = len(df)
    df = df.drop_duplicates(subset=["email"])
    df = df.dropna(subset=["borrower_name", "email", "phone"])
    df["phone"] = df["phone"].astype(str).str.strip()
    removed = before - len(df)
    return df, {
        "phase": "transform",
        "entity": "borrowers",
        "rows_before": before,
        "rows_after": len(df),
        "rows_removed": removed,
        "message": f"borrowers: {before} → {len(df)} rows ({removed} dirty rows removed — duplicates & nulls)",
    }


def transform_transactions(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    before = len(df)
    df = df.drop_duplicates(subset=["transaction_id"])
    df = df.dropna(subset=["book_id", "borrower_id", "borrow_date"])
    df["borrow_date"] = pd.to_datetime(df["borrow_date"], errors="coerce")
    df = df.dropna(subset=["borrow_date"])

    if "due_date" not in df.columns or df["due_date"].isna().all():
        df["due_date"] = df["borrow_date"] + timedelta(days=14)
    else:
        df["due_date"] = pd.to_datetime(df["due_date"], errors="coerce")
        mask = df["due_date"].isna()
        df.loc[mask, "due_date"] = df.loc[mask, "borrow_date"] + timedelta(days=14)

    df["return_date"] = pd.to_datetime(df["return_date"], errors="coerce")
    df["book_id"]         = df["book_id"].astype(int)
    df["borrower_id"]     = df["borrower_id"].astype(int)
    df["transaction_id"]  = df["transaction_id"].astype(int)

    removed = before - len(df)
    return df, {
        "phase": "transform",
        "entity": "transactions",
        "rows_before": before,
        "rows_after": len(df),
        "rows_removed": removed,
        "message": f"transactions: {before} → {len(df)} rows ({removed} dirty rows removed — duplicates, nulls & invalid dates)",
    }


# ── LOAD ──────────────────────────────────────────────────────────────────────

def load_books(db: Session, df: pd.DataFrame) -> dict:
    for _, row in df.iterrows():
        db.merge(models.Book(
            book_id=int(row["book_id"]),
            title=row["title"],
            author=row["author"],
            category=row["category"],
            isbn=row["isbn"],
            availability_status=row["availability_status"],
        ))
    db.commit()
    return {
        "phase": "load",
        "entity": "books",
        "rows_loaded": len(df),
        "message": f"Loaded {len(df)} books into database (upsert)",
    }


def load_borrowers(db: Session, df: pd.DataFrame) -> dict:
    for _, row in df.iterrows():
        db.merge(models.Borrower(
            borrower_id=int(row["borrower_id"]),
            borrower_name=row["borrower_name"],
            email=row["email"],
            phone=str(row["phone"]),
        ))
    db.commit()
    return {
        "phase": "load",
        "entity": "borrowers",
        "rows_loaded": len(df),
        "message": f"Loaded {len(df)} borrowers into database (upsert)",
    }


def load_transactions(db: Session, df: pd.DataFrame) -> dict:
    for _, row in df.iterrows():
        return_val = None if pd.isna(row["return_date"]) else row["return_date"].to_pydatetime()
        db.merge(models.Transaction(
            transaction_id=int(row["transaction_id"]),
            book_id=int(row["book_id"]),
            borrower_id=int(row["borrower_id"]),
            borrow_date=row["borrow_date"].to_pydatetime(),
            due_date=row["due_date"].to_pydatetime(),
            return_date=return_val,
        ))
    db.commit()
    return {
        "phase": "load",
        "entity": "transactions",
        "rows_loaded": len(df),
        "message": f"Loaded {len(df)} transactions into database (upsert)",
    }


# ── MAIN ──────────────────────────────────────────────────────────────────────

def run_etl() -> dict[str, Any]:
    """
    Runs the full ETL pipeline.
    Returns a structured report dict suitable for both CLI printing and API responses.
    """
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    started_at = datetime.utcnow()
    steps: list[dict] = []

    try:
        # EXTRACT
        books_raw,        s = extract(BOOKS_CSV);        steps.append(s)
        borrowers_raw,    s = extract(BORROWERS_CSV);    steps.append(s)
        transactions_raw, s = extract(TRANSACTIONS_CSV); steps.append(s)

        # TRANSFORM
        books_clean,        s = transform_books(books_raw);               steps.append(s)
        borrowers_clean,    s = transform_borrowers(borrowers_raw);        steps.append(s)
        transactions_clean, s = transform_transactions(transactions_raw);  steps.append(s)

        # LOAD
        steps.append(load_books(db, books_clean))
        steps.append(load_borrowers(db, borrowers_clean))
        steps.append(load_transactions(db, transactions_clean))

        duration = (datetime.utcnow() - started_at).total_seconds()

        report = {
            "status": "success",
            "started_at": started_at.isoformat(),
            "duration_seconds": round(duration, 2),
            "steps": steps,
            "summary": {
                "books":        {"extracted": len(books_raw),        "loaded": len(books_clean),        "removed": len(books_raw)        - len(books_clean)},
                "borrowers":    {"extracted": len(borrowers_raw),    "loaded": len(borrowers_clean),    "removed": len(borrowers_raw)    - len(borrowers_clean)},
                "transactions": {"extracted": len(transactions_raw), "loaded": len(transactions_clean), "removed": len(transactions_raw) - len(transactions_clean)},
            },
            "error": None,
        }
    except Exception as exc:
        db.rollback()
        report = {
            "status": "error",
            "started_at": started_at.isoformat(),
            "duration_seconds": round((datetime.utcnow() - started_at).total_seconds(), 2),
            "steps": steps,
            "summary": {},
            "error": str(exc),
        }
    finally:
        db.close()

    return report


# ── CLI entry-point ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    report = run_etl()
    print(f"\n========== ETL Pipeline {'Complete' if report['status'] == 'success' else 'FAILED'} ==========")
    for step in report["steps"]:
        print(f"  [{step['phase'].upper():9s}] {step['message']}")
    if report["error"]:
        print(f"\n[ERROR] {report['error']}")
    else:
        print(f"\nDuration: {report['duration_seconds']}s")
    print("=" * 50)
