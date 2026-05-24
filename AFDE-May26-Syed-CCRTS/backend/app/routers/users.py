from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserUpdate
from app.utils.auth import get_current_user, require_role

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("")
def list_users(db: Session = Depends(get_db), current_user: User = Depends(require_role("Admin"))):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "role_id": u.role_id,
            "role_name": u.role.name,
            "is_active": u.is_active,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.get("/agents")
def list_agents(db: Session = Depends(get_db), current_user: User = Depends(require_role("Admin", "Supervisor"))):
    agent_role = db.query(Role).filter(Role.name == "Support Agent").first()
    if not agent_role:
        return []
    agents = db.query(User).filter(User.role_id == agent_role.id, User.is_active == True).all()
    return [{"id": a.id, "name": a.name, "email": a.email} for a in agents]


@router.get("/roles")
def list_roles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    roles = db.query(Role).all()
    return [{"id": r.id, "name": r.name} for r in roles]


@router.put("/{user_id}")
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.name is not None:
        user.name = data.name
    if data.phone is not None:
        user.phone = data.phone
    if data.is_active is not None:
        user.is_active = data.is_active
    db.commit()
    return {"message": "User updated successfully"}
