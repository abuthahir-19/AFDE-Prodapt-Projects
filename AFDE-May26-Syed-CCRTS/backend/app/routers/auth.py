from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.auth import LoginRequest
from app.schemas.user import UserCreate
from app.services.auth_service import authenticate_user, create_user
from app.utils.auth import create_access_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if not db.query(Role).filter(Role.id == user_data.role_id).first():
        raise HTTPException(status_code=400, detail="Invalid role")

    user = create_user(db, user_data.name, user_data.email, user_data.password, user_data.phone, user_data.role_id)
    return {"message": "User registered successfully", "user_id": user.id}


@router.post("/login")
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.name,
            "role_id": user.role_id,
        },
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role.name,
        "role_id": current_user.role_id,
        "is_active": current_user.is_active,
    }
