from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas import TicketCreate, TicketUpdate, TicketResponse
import crud

router = APIRouter()


@router.get("/tickets", response_model=List[TicketResponse])
def get_all_tickets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tickets = crud.get_tickets(db, skip=skip, limit=limit)
    return tickets


@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = crud.get_ticket(db, ticket_id=ticket_id)
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with ID {ticket_id} not found",
        )
    return ticket


@router.post("/tickets", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    return crud.create_ticket(db=db, ticket=ticket)


@router.put("/tickets/{ticket_id}", response_model=TicketResponse)
def update_ticket(ticket_id: int, ticket: TicketUpdate, db: Session = Depends(get_db)):
    updated_ticket = crud.update_ticket(db=db, ticket_id=ticket_id, ticket=ticket)
    if updated_ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with ID {ticket_id} not found",
        )
    return updated_ticket


@router.delete("/tickets/{ticket_id}", response_model=TicketResponse)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    deleted_ticket = crud.delete_ticket(db=db, ticket_id=ticket_id)
    if deleted_ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with ID {ticket_id} not found",
        )
    return deleted_ticket


@router.get("/search", response_model=List[TicketResponse])
def search_tickets(
    keyword: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
):
    tickets = crud.search_tickets(
        db=db,
        keyword=keyword,
        category=category,
        status=status,
        priority=priority,
    )
    return tickets
