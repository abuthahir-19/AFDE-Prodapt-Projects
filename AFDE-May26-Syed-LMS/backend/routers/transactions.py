from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db

router = APIRouter(tags=["Transactions"])


@router.post("/borrow", response_model=schemas.TransactionResponse, status_code=201)
def borrow_book(borrow_req: schemas.BorrowRequest, db: Session = Depends(get_db)):
    transaction = crud.borrow_book(db, borrow_req)
    if not transaction:
        raise HTTPException(
            status_code=400,
            detail="Book is not available or does not exist",
        )
    return transaction


@router.post("/return", response_model=schemas.TransactionResponse)
def return_book(return_req: schemas.ReturnRequest, db: Session = Depends(get_db)):
    transaction = crud.return_book(db, return_req)
    if not transaction:
        raise HTTPException(
            status_code=400,
            detail="Transaction not found or book already returned",
        )
    return transaction


@router.get("/transactions", response_model=List[schemas.TransactionResponse])
def get_transactions(db: Session = Depends(get_db)):
    return crud.get_transactions(db)
