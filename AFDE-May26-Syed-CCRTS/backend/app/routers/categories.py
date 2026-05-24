from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate
from app.utils.auth import get_current_user, require_role

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("")
def list_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cats = db.query(Category).all()
    return [{"id": c.id, "name": c.name, "description": c.description} for c in cats]


@router.post("")
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    if db.query(Category).filter(Category.name == data.name).first():
        raise HTTPException(status_code=400, detail="Category already exists")
    cat = Category(name=data.name, description=data.description)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return {"id": cat.id, "name": cat.name, "message": "Category created"}


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted"}
