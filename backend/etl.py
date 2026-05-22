"""
ETL Pipeline for Library Management System — Phase 2
Usage: cd backend && python etl.py

Extracts data from CSV files in ../data/, transforms (deduplicates and
drops records with missing required fields), then loads into SQLite.
"""
import os
import sys
from datetime import timedelta

import pandas as pd
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.dirname(__file__))
from database import SessionLocal, engine
import models

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
BOOKS_CSV = os.path.join(DATA_DIR, "books.csv")
BORROWERS_CSV = os.path.join(DATA_DIR, "borrowers.csv")
TRANSACTIONS_CSV = os.path.join(DATA_DIR, "transactions.csv")


# ── EXTRACT ───────────────────────────────────────────────────────────────────

def extract(filepath: str) -> pd.DataFrame:
    df = pd.read_csv(filepath)
    print(f"[EXTRACT] {os.path.basename(filepath)}: {len(df)} rows, {len(df.columns)} columns")
    return df


# ── TRANSFORM ─────────────────────────────────────────────────────────────────

def transform_books(df: pd.DataFrame) -> pd.DataFrame:
    before = len(df)
    df = df.drop_duplicates(subset=["isbn"])
    df = df.dropna(subset=["title", "author", "category", "isbn"])
    df["availability_status"] = df["availability_status"].fillna("available")
    df["availability_status"] = df["availability_status"].str.strip().str.lower()
    print(f"[TRANSFORM] books: {before} -> {len(df)} rows (removed {before - len(df)} dirty rows)")
    return df


def transform_borrowers(df: pd.DataFrame) -> pd.DataFrame:
    before = len(df)
    df = df.drop_duplicates(subset=["email"])
    df = df.dropna(subset=["borrower_name", "email", "phone"])
    df["phone"] = df["phone"].astype(str).str.strip()
    print(f"[TRANSFORM] borrowers: {before} -> {len(df)} rows (removed {before - len(df)} dirty rows)")
    return df


def transform_transactions(df: pd.DataFrame) -> pd.DataFrame:
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

    df["book_id"] = df["book_id"].astype(int)
    df["borrower_id"] = df["borrower_id"].astype(int)
    df["transaction_id"] = df["transaction_id"].astype(int)

    print(f"[TRANSFORM] transactions: {before} -> {len(df)} rows (removed {before - len(df)} dirty rows)")
    return df


# ── LOAD ──────────────────────────────────────────────────────────────────────

def load_books(db: Session, df: pd.DataFrame):
    for _, row in df.iterrows():
        book = models.Book(
            book_id=int(row["book_id"]),
            title=row["title"],
            author=row["author"],
            category=row["category"],
            isbn=row["isbn"],
            availability_status=row["availability_status"],
        )
        db.merge(book)
    db.commit()
    print(f"[LOAD] Loaded {len(df)} books into database")


def load_borrowers(db: Session, df: pd.DataFrame):
    for _, row in df.iterrows():
        borrower = models.Borrower(
            borrower_id=int(row["borrower_id"]),
            borrower_name=row["borrower_name"],
            email=row["email"],
            phone=str(row["phone"]),
        )
        db.merge(borrower)
    db.commit()
    print(f"[LOAD] Loaded {len(df)} borrowers into database")


def load_transactions(db: Session, df: pd.DataFrame):
    for _, row in df.iterrows():
        return_val = None if pd.isna(row["return_date"]) else row["return_date"].to_pydatetime()
        tx = models.Transaction(
            transaction_id=int(row["transaction_id"]),
            book_id=int(row["book_id"]),
            borrower_id=int(row["borrower_id"]),
            borrow_date=row["borrow_date"].to_pydatetime(),
            due_date=row["due_date"].to_pydatetime(),
            return_date=return_val,
        )
        db.merge(tx)
    db.commit()
    print(f"[LOAD] Loaded {len(df)} transactions into database")


# ── MAIN ──────────────────────────────────────────────────────────────────────

def run_etl():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("\n========== ETL Pipeline Start ==========")

        books_raw = extract(BOOKS_CSV)
        borrowers_raw = extract(BORROWERS_CSV)
        transactions_raw = extract(TRANSACTIONS_CSV)

        books_clean = transform_books(books_raw)
        borrowers_clean = transform_borrowers(borrowers_raw)
        transactions_clean = transform_transactions(transactions_raw)

        load_books(db, books_clean)
        load_borrowers(db, borrowers_clean)
        load_transactions(db, transactions_clean)

        print("========== ETL Pipeline Complete ==========\n")
    except Exception as exc:
        print(f"[ERROR] ETL failed: {exc}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    run_etl()
