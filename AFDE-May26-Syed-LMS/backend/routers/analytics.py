from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

import models
from database import get_db

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/most-borrowed-books")
def most_borrowed_books(limit: int = 10, db: Session = Depends(get_db)):
    results = (
        db.query(
            models.Book.book_id,
            models.Book.title,
            models.Book.author,
            models.Book.category,
            func.count(models.Transaction.transaction_id).label("borrow_count"),
        )
        .join(models.Transaction, models.Book.book_id == models.Transaction.book_id)
        .group_by(models.Book.book_id)
        .order_by(func.count(models.Transaction.transaction_id).desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "book_id": r.book_id,
            "title": r.title,
            "author": r.author,
            "category": r.category,
            "borrow_count": r.borrow_count,
        }
        for r in results
    ]


@router.get("/category-stats")
def category_stats(db: Session = Depends(get_db)):
    results = (
        db.query(
            models.Book.category,
            func.count(models.Transaction.transaction_id).label("borrow_count"),
        )
        .join(models.Transaction, models.Book.book_id == models.Transaction.book_id)
        .group_by(models.Book.category)
        .order_by(func.count(models.Transaction.transaction_id).desc())
        .all()
    )
    return [{"category": r.category, "borrow_count": r.borrow_count} for r in results]


@router.get("/monthly-trends")
def monthly_trends(db: Session = Depends(get_db)):
    results = (
        db.query(
            func.strftime("%Y-%m", models.Transaction.borrow_date).label("month"),
            func.count(models.Transaction.transaction_id).label("borrow_count"),
        )
        .group_by(func.strftime("%Y-%m", models.Transaction.borrow_date))
        .order_by(func.strftime("%Y-%m", models.Transaction.borrow_date))
        .all()
    )
    return [{"month": r.month, "borrow_count": r.borrow_count} for r in results]


@router.get("/overdue-transactions")
def overdue_transactions(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    results = (
        db.query(
            models.Transaction.transaction_id,
            models.Transaction.book_id,
            models.Book.title,
            models.Transaction.borrower_id,
            models.Borrower.borrower_name,
            models.Transaction.borrow_date,
            models.Transaction.due_date,
        )
        .join(models.Book, models.Book.book_id == models.Transaction.book_id)
        .join(models.Borrower, models.Borrower.borrower_id == models.Transaction.borrower_id)
        .filter(
            models.Transaction.return_date.is_(None),
            models.Transaction.due_date < now,
        )
        .order_by(models.Transaction.due_date)
        .all()
    )
    return [
        {
            "transaction_id": r.transaction_id,
            "book_id": r.book_id,
            "title": r.title,
            "borrower_id": r.borrower_id,
            "borrower_name": r.borrower_name,
            "borrow_date": r.borrow_date.isoformat(),
            "due_date": r.due_date.isoformat(),
            "days_overdue": (now - r.due_date).days,
        }
        for r in results
    ]
