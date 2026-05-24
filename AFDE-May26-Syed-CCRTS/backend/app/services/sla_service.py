from datetime import datetime, timedelta

SLA_HOURS = {
    "Low": 72,
    "Medium": 48,
    "High": 24,
    "Critical": 4,
}


def calculate_sla_deadline(priority: str, created_at: datetime) -> datetime:
    hours = SLA_HOURS.get(priority, 48)
    return created_at + timedelta(hours=hours)


def is_sla_breached(sla_deadline: datetime) -> bool:
    return datetime.utcnow() > sla_deadline.replace(tzinfo=None)


def get_sla_status(sla_deadline: datetime) -> dict:
    now = datetime.utcnow()
    deadline = sla_deadline.replace(tzinfo=None) if sla_deadline.tzinfo else sla_deadline
    remaining = deadline - now
    if remaining.total_seconds() < 0:
        return {"breached": True, "hours_overdue": round(abs(remaining.total_seconds()) / 3600, 2)}
    return {"breached": False, "hours_remaining": round(remaining.total_seconds() / 3600, 2)}
