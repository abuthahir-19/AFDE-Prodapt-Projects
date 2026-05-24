from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db

router = APIRouter(tags=["Search"])


@router.get("/search", response_model=List[schemas.BookResponse])
def search_books(q: str = Query(..., description="Search by title, author, or category"), db: Session = Depends(get_db)):
    return crud.search_books(db, q)
