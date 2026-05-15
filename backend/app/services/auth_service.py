from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.auth import verify_password, get_password_hash


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_user(db: Session, name: str, email: str, password: str, phone: str, role_id: int) -> User:
    user = User(
        name=name,
        email=email,
        hashed_password=get_password_hash(password),
        phone=phone,
        role_id=role_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
