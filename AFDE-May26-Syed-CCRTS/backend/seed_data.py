"""
Run this script once after setting up the database to populate default roles,
categories, and demo user accounts.

Usage:
    cd backend
    python seed_data.py
"""
from app.database import SessionLocal, engine, Base
from app import models  # noqa: F401
from app.models.role import Role
from app.models.user import User
from app.models.category import Category
from app.utils.auth import get_password_hash


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # --- Roles ---
    role_names = ["Admin", "Support Agent", "Supervisor", "Customer", "Quality Team"]
    role_map = {}
    for name in role_names:
        role = db.query(Role).filter(Role.name == name).first()
        if not role:
            role = Role(name=name)
            db.add(role)
            db.commit()
            db.refresh(role)
        role_map[name] = role.id

    # --- Categories ---
    categories = [
        ("Billing Issues", "Issues related to billing and payments"),
        ("Service Disruption", "Service outages and disruptions"),
        ("Product Defects", "Defective products and quality issues"),
        ("Technical Problems", "Technical and system issues"),
        ("Delivery Delays", "Delays in delivery or shipping"),
        ("Account Issues", "Account access and management issues"),
        ("Customer Service Complaints", "Issues with customer service interactions"),
    ]
    for cat_name, cat_desc in categories:
        if not db.query(Category).filter(Category.name == cat_name).first():
            db.add(Category(name=cat_name, description=cat_desc))
    db.commit()

    # --- Demo Users ---
    demo_users = [
        ("System Admin", "admin@ccrs.com", "Admin@123", None, "Admin"),
        ("Jane Supervisor", "supervisor@ccrs.com", "Supervisor@123", None, "Supervisor"),
        ("John Agent", "agent@ccrs.com", "Agent@123", "+1-555-0101", "Support Agent"),
        ("Alice Customer", "customer@ccrs.com", "Customer@123", "+1-555-0202", "Customer"),
        ("Quality Analyst", "quality@ccrs.com", "Quality@123", None, "Quality Team"),
    ]
    for name, email, password, phone, role_name in demo_users:
        if not db.query(User).filter(User.email == email).first():
            db.add(User(
                name=name,
                email=email,
                hashed_password=get_password_hash(password),
                phone=phone,
                role_id=role_map[role_name],
            ))
    db.commit()
    db.close()

    print("Seed data inserted successfully!")
    print("\nDemo accounts:")
    print("  Admin      : admin@ccrs.com       / Admin@123")
    print("  Supervisor : supervisor@ccrs.com  / Supervisor@123")
    print("  Agent      : agent@ccrs.com       / Agent@123")
    print("  Customer   : customer@ccrs.com    / Customer@123")
    print("  Quality    : quality@ccrs.com     / Quality@123")


if __name__ == "__main__":
    seed()
