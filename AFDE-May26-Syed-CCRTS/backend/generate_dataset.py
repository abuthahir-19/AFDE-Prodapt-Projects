"""
Generates 250 synthetic complaint records for CCRS Phase 2 analytics.

Usage:
    cd backend
    python generate_dataset.py            # skips if >50 complaints exist
    python generate_dataset.py --force    # drops and regenerates
"""
import os
import sys
import random
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app import models  # noqa: F401
from app.models.role import Role
from app.models.user import User
from app.models.category import Category
from app.models.complaint import Complaint
from app.services.sla_service import SLA_HOURS
from app.services.complaint_service import generate_complaint_number
from app.utils.auth import get_password_hash

TITLES_BY_CATEGORY = {
    "Billing Issues": [
        "Incorrect charge on invoice", "Double billing this month",
        "Unauthorized subscription renewal", "Refund not processed",
        "Wrong tax amount applied", "Late payment fee dispute",
    ],
    "Service Disruption": [
        "Service down since morning", "Intermittent outages all week",
        "Complete loss of service", "Scheduled maintenance overran",
        "Service degraded after update", "API unavailable for hours",
    ],
    "Product Defects": [
        "Item arrived damaged", "Product stops working after 2 days",
        "Missing components in package", "Quality below advertised standard",
        "Safety hazard with product", "Manufacturing defect found",
    ],
    "Technical Problems": [
        "Cannot log in to portal", "API returning 500 errors",
        "Mobile app crashes on startup", "Data sync not working",
        "Integration broken after update", "Performance degraded significantly",
    ],
    "Delivery Delays": [
        "Order delayed by 2 weeks", "Package stuck in transit",
        "Wrong item delivered", "Delivery to wrong address",
        "No tracking updates for 5 days", "Express delivery arrived late",
    ],
    "Account Issues": [
        "Account locked without reason", "Cannot reset password",
        "Profile changes not saving", "Two-factor auth not working",
        "Account merged with wrong user", "Subscription not activating",
    ],
    "Customer Service Complaints": [
        "Agent was rude during call", "Waited 45 minutes on hold",
        "Received conflicting information", "No follow-up after promise",
        "Chat support gave wrong instructions", "Issue not resolved after 3 calls",
    ],
}

PRIORITIES = ["Low", "Medium", "High", "Critical"]
PRIORITY_WEIGHTS = [0.25, 0.40, 0.25, 0.10]

TARGET_RECORDS = 250
RESOLVED_FRACTION = 0.70
TARGET_BREACH_RATE = 0.30


def ensure_extra_agents(db, agent_role_id):
    extra = [
        ("Sarah Mitchell", "agent2@ccrs.com"),
        ("David Chen",     "agent3@ccrs.com"),
        ("Emma Rodriguez", "agent4@ccrs.com"),
    ]
    for name, email in extra:
        if not db.query(User).filter(User.email == email).first():
            db.add(User(
                name=name, email=email,
                hashed_password=get_password_hash("Agent@123"),
                role_id=agent_role_id, is_active=True,
            ))
    db.commit()


def ensure_extra_customers(db, customer_role_id):
    for i in range(1, 11):
        email = f"customer{i:02d}@ccrs.com"
        if not db.query(User).filter(User.email == email).first():
            db.add(User(
                name=f"Customer {i:02d}", email=email,
                hashed_password=get_password_hash("Customer@123"),
                role_id=customer_role_id, is_active=True,
            ))
    db.commit()


def generate():
    db = SessionLocal()
    Base.metadata.create_all(bind=engine)

    force = "--force" in sys.argv
    existing = db.query(Complaint).count()
    if existing > 50 and not force:
        print(f"Database already has {existing} complaints. Use --force to regenerate.")
        db.close()
        return

    if force and existing > 0:
        print(f"--force: removing {existing} existing complaints...")
        db.query(Complaint).delete()
        db.commit()

    agent_role = db.query(Role).filter(Role.name == "Support Agent").first()
    customer_role = db.query(Role).filter(Role.name == "Customer").first()
    if not agent_role or not customer_role:
        print("ERROR: Run seed_data.py first (roles must exist).")
        db.close()
        return

    ensure_extra_agents(db, agent_role.id)
    ensure_extra_customers(db, customer_role.id)

    agents = db.query(User).filter(User.role_id == agent_role.id).all()
    customers = db.query(User).filter(User.role_id == customer_role.id).all()
    categories = db.query(Category).all()
    category_names = [c.name for c in categories]

    now = datetime.utcnow()
    records = []

    for _ in range(TARGET_RECORDS):
        cat_name = random.choice(category_names)
        category = next(c for c in categories if c.name == cat_name)
        title_pool = TITLES_BY_CATEGORY.get(cat_name, ["General complaint"])
        title = random.choice(title_pool)

        priority = random.choices(PRIORITIES, weights=PRIORITY_WEIGHTS, k=1)[0]
        sla_hours = SLA_HOURS[priority]

        days_ago = random.uniform(0, 365)
        created_at = now - timedelta(days=days_ago)
        sla_deadline = created_at + timedelta(hours=sla_hours)

        has_agent = random.random() > 0.10
        agent = random.choice(agents) if has_agent else None

        is_resolved = random.random() < RESOLVED_FRACTION

        if is_resolved:
            should_breach = random.random() < (TARGET_BREACH_RATE / RESOLVED_FRACTION)
            if should_breach:
                breach_extra = random.uniform(1, max(2.0, sla_hours * 0.5))
                resolved_date = sla_deadline + timedelta(hours=breach_extra)
            else:
                safe_window = max(1.0, sla_hours - 1)
                resolved_date = created_at + timedelta(hours=random.uniform(0.5, safe_window))
            status = random.choice(["Resolved", "Closed"])
        else:
            resolved_date = None
            if sla_deadline < now:
                status = random.choice(["Escalated", "In Progress", "Open"])
            elif agent:
                status = random.choice(["Open", "Assigned", "In Progress"])
            else:
                status = "Open"

        records.append(Complaint(
            complaint_number=generate_complaint_number(),
            title=title,
            customer_id=random.choice(customers).id,
            category_id=category.id,
            assigned_agent_id=agent.id if agent else None,
            description=(
                f"Complaint regarding {cat_name.lower()}. {title}. "
                "Customer reports the issue persists and requires resolution."
            ),
            priority=priority,
            status=status,
            escalation_level=1 if status == "Escalated" else 0,
            sla_deadline=sla_deadline,
            resolved_date=resolved_date,
            created_at=created_at,
        ))

    db.bulk_save_objects(records)
    db.commit()

    total = db.query(Complaint).count()
    print(f"Dataset generated. Total complaints in DB: {total}")
    print(f"Agents: {len(agents)}, Customers: {len(customers)}, Categories: {len(categories)}")
    db.close()


if __name__ == "__main__":
    generate()
