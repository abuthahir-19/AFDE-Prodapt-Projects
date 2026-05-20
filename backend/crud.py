from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import Ticket
from schemas import TicketCreate, TicketUpdate


def get_tickets(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Ticket).offset(skip).limit(limit).all()


def get_ticket(db: Session, ticket_id: int):
    return db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()


def create_ticket(db: Session, ticket: TicketCreate):
    db_ticket = Ticket(
        employee_name=ticket.employee_name,
        department=ticket.department,
        issue_category=ticket.issue_category,
        description=ticket.description,
        priority=ticket.priority,
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def update_ticket(db: Session, ticket_id: int, ticket: TicketUpdate):
    db_ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if db_ticket is None:
        return None
    update_data = ticket.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_ticket, key, value)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def delete_ticket(db: Session, ticket_id: int):
    db_ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if db_ticket is None:
        return None
    db.delete(db_ticket)
    db.commit()
    return db_ticket


def search_tickets(
    db: Session,
    keyword: str = None,
    category: str = None,
    status: str = None,
    priority: str = None,
):
    query = db.query(Ticket)

    if keyword:
        query = query.filter(
            or_(
                Ticket.employee_name.ilike(f"%{keyword}%"),
                Ticket.description.ilike(f"%{keyword}%"),
                Ticket.department.ilike(f"%{keyword}%"),
            )
        )

    if category:
        query = query.filter(Ticket.issue_category == category)

    if status:
        query = query.filter(Ticket.status == status)

    if priority:
        query = query.filter(Ticket.priority == priority)

    return query.all()
