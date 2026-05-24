import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Ticket, HistoricalTicket
from etl.pipeline import run_pipeline

# ---------------------------------------------------------------------------
# Sample live tickets
# ---------------------------------------------------------------------------
SEED_TICKETS = [
    {
        "employee_name": "Alice Johnson",
        "department": "IT",
        "issue_category": "VPN Issue",
        "description": "Unable to connect to the company VPN from home. Getting an authentication error on every attempt since yesterday.",
        "priority": "High",
        "status": "Open",
        "days_ago": 2,
    },
    {
        "employee_name": "Bob Smith",
        "department": "HR",
        "issue_category": "Password Reset",
        "description": "Account locked after too many failed login attempts. Need password reset for the HR portal.",
        "priority": "Low",
        "status": "Resolved",
        "resolution_notes": "Password reset via admin console. User advised to use password manager.",
        "days_ago": 10,
    },
    {
        "employee_name": "Carol White",
        "department": "Finance",
        "issue_category": "Software Installation",
        "description": "Need MS Excel Power Query add-in installed for quarterly report automation. IT approval already obtained.",
        "priority": "Medium",
        "status": "In Progress",
        "days_ago": 3,
    },
    {
        "employee_name": "David Brown",
        "department": "Marketing",
        "issue_category": "Laptop Issue",
        "description": "Laptop display flickering intermittently. Occurs every 10–15 minutes and disrupts video calls.",
        "priority": "High",
        "status": "Open",
        "days_ago": 1,
    },
    {
        "employee_name": "Eve Davis",
        "department": "Operations",
        "issue_category": "Email Access",
        "description": "Cannot access shared mailbox 'ops-alerts@company.com'. Receiving permission denied error since last Monday.",
        "priority": "Medium",
        "status": "Resolved",
        "resolution_notes": "Shared mailbox permissions updated in Exchange Admin. Access confirmed by user.",
        "days_ago": 7,
    },
    {
        "employee_name": "Frank Miller",
        "department": "IT",
        "issue_category": "Network Connectivity",
        "description": "Entire floor 3 experiencing intermittent Wi-Fi dropouts every few minutes. Affects all devices on the floor.",
        "priority": "Critical",
        "status": "Closed",
        "resolution_notes": "Access point on floor 3 replaced. Network stable for 48 hours post-fix.",
        "days_ago": 15,
    },
    {
        "employee_name": "Grace Wilson",
        "department": "HR",
        "issue_category": "Hardware Request",
        "description": "Requesting a second monitor for the new hybrid work setup approved by manager. Dell 24\" preferred.",
        "priority": "Low",
        "status": "In Progress",
        "days_ago": 5,
    },
    {
        "employee_name": "Henry Moore",
        "department": "Finance",
        "issue_category": "VPN Issue",
        "description": "VPN connects but immediately drops after 30 seconds. Issue started after last Windows update.",
        "priority": "High",
        "status": "Open",
        "days_ago": 1,
    },
    {
        "employee_name": "Iris Taylor",
        "department": "Marketing",
        "issue_category": "Password Reset",
        "description": "Forgot password for the marketing analytics platform (Tableau). Need urgent reset before client presentation at 2 PM.",
        "priority": "Critical",
        "status": "Resolved",
        "resolution_notes": "Password reset link sent via registered mobile. User confirmed access.",
        "days_ago": 4,
    },
    {
        "employee_name": "Jack Anderson",
        "department": "Operations",
        "issue_category": "Software Installation",
        "description": "Requesting installation of Python 3.11 and VS Code for automation scripts. Approved by department head.",
        "priority": "Medium",
        "status": "Closed",
        "resolution_notes": "Software installed and environment variables configured. User tested successfully.",
        "days_ago": 20,
    },
    {
        "employee_name": "Karen Thomas",
        "department": "IT",
        "issue_category": "Laptop Issue",
        "description": "Laptop battery draining within 2 hours despite being plugged in. Laptop is only 8 months old.",
        "priority": "Medium",
        "status": "Open",
        "days_ago": 3,
    },
    {
        "employee_name": "Liam Jackson",
        "department": "HR",
        "issue_category": "Email Access",
        "description": "Outlook keeps asking for credentials on every startup despite saved password. Happening since Office update.",
        "priority": "Low",
        "status": "Resolved",
        "resolution_notes": "Cleared credential manager cache and re-authenticated. Issue resolved.",
        "days_ago": 8,
    },
    {
        "employee_name": "Mia White",
        "department": "Finance",
        "issue_category": "Network Connectivity",
        "description": "VPN-connected machines on finance floor unable to reach the internal SAP server. Blocking end-of-month close.",
        "priority": "Critical",
        "status": "Resolved",
        "resolution_notes": "Firewall rule misconfiguration identified and corrected. SAP access restored.",
        "days_ago": 6,
    },
    {
        "employee_name": "Noah Harris",
        "department": "Marketing",
        "issue_category": "Hardware Request",
        "description": "Requesting a USB-C docking station for the new MacBook Pro issued last week.",
        "priority": "Low",
        "status": "Open",
        "days_ago": 2,
    },
    {
        "employee_name": "Olivia Martin",
        "department": "Operations",
        "issue_category": "VPN Issue",
        "description": "New employee cannot connect to VPN at all. Credentials set up but client throws error code 691.",
        "priority": "High",
        "status": "In Progress",
        "days_ago": 1,
    },
    {
        "employee_name": "Peter Garcia",
        "department": "IT",
        "issue_category": "Password Reset",
        "description": "Windows Hello face recognition stopped working after display driver update. PIN also not accepted.",
        "priority": "Medium",
        "status": "Open",
        "days_ago": 1,
    },
    {
        "employee_name": "Quinn Rodriguez",
        "department": "HR",
        "issue_category": "Software Installation",
        "description": "Need DocuSign desktop client installed on new HR laptop for digital contract signing workflow.",
        "priority": "Medium",
        "status": "Resolved",
        "resolution_notes": "DocuSign installed and user account linked. Tested signing with a sample document.",
        "days_ago": 12,
    },
    {
        "employee_name": "Rachel Lewis",
        "department": "Finance",
        "issue_category": "Laptop Issue",
        "description": "Laptop overheating and throttling during large Excel model calculations. Fan running at full speed constantly.",
        "priority": "High",
        "status": "In Progress",
        "days_ago": 2,
    },
    {
        "employee_name": "Sam Lee",
        "department": "Marketing",
        "issue_category": "Email Access",
        "description": "Unable to send emails larger than 5 MB. Attachments rejected. Other team members unaffected.",
        "priority": "Medium",
        "status": "Closed",
        "resolution_notes": "Mailbox send quota corrected via Exchange Admin. User confirmed large attachments now send.",
        "days_ago": 18,
    },
    {
        "employee_name": "Tina Walker",
        "department": "Operations",
        "issue_category": "Network Connectivity",
        "description": "Printer on floor 2 not discoverable on the network after IT restructured VLANs last Friday.",
        "priority": "Medium",
        "status": "Open",
        "days_ago": 4,
    },
    {
        "employee_name": "Uma Scott",
        "department": "IT",
        "issue_category": "Hardware Request",
        "description": "Keyboard and mouse replacement needed. Current peripherals have sticky keys and erratic cursor movement.",
        "priority": "Low",
        "status": "Resolved",
        "resolution_notes": "Logitech MK550 combo dispatched from IT stock. User confirmed receipt.",
        "days_ago": 9,
    },
    {
        "employee_name": "Victor Hall",
        "department": "HR",
        "issue_category": "VPN Issue",
        "description": "VPN works but extremely slow (under 1 Mbps). Impacts video calls and file access from home.",
        "priority": "Medium",
        "status": "Resolved",
        "resolution_notes": "Split tunneling enabled for user's profile. Speeds back to normal per user confirmation.",
        "days_ago": 11,
    },
    {
        "employee_name": "Wendy Allen",
        "department": "Finance",
        "issue_category": "Password Reset",
        "description": "Multi-factor authentication app deleted accidentally. Cannot log in to any SSO-protected systems.",
        "priority": "Critical",
        "status": "Open",
        "days_ago": 0,
    },
    {
        "employee_name": "Xavier Young",
        "department": "Marketing",
        "issue_category": "Software Installation",
        "description": "Adobe Creative Cloud subscription renewed but apps showing as expired on this machine. Need re-activation.",
        "priority": "High",
        "status": "In Progress",
        "days_ago": 1,
    },
    {
        "employee_name": "Yara Hernandez",
        "department": "Operations",
        "issue_category": "Laptop Issue",
        "description": "Laptop dropped and screen cracked. Device still functional but display is unusable. Need replacement or repair.",
        "priority": "High",
        "status": "Open",
        "days_ago": 0,
    },
]


def seed_tickets(db: Session) -> int:
    if db.query(Ticket).count() > 0:
        return 0

    now = datetime.utcnow()
    for t in SEED_TICKETS:
        created_at = now - timedelta(days=t["days_ago"])
        ticket = Ticket(
            employee_name=t["employee_name"],
            department=t["department"],
            issue_category=t["issue_category"],
            description=t["description"],
            priority=t["priority"],
            status=t["status"],
            resolution_notes=t.get("resolution_notes"),
            created_at=created_at,
        )
        db.add(ticket)
    db.commit()
    return len(SEED_TICKETS)


def seed_historical(db: Session) -> int:
    if db.query(HistoricalTicket).count() > 0:
        return 0

    csv_path = os.path.join(os.path.dirname(__file__), "data", "sample_tickets.csv")
    if not os.path.exists(csv_path):
        return 0

    with open(csv_path, "rb") as f:
        file_bytes = f.read()

    result = run_pipeline(file_bytes, db)
    return result["rows_loaded"]


def run_seed():
    db: Session = SessionLocal()
    try:
        tickets_added = seed_tickets(db)
        historical_added = seed_historical(db)
        if tickets_added:
            print(f"[Seed] Inserted {tickets_added} sample tickets.")
        if historical_added:
            print(f"[Seed] Loaded {historical_added} historical records from CSV.")
        if not tickets_added and not historical_added:
            print("[Seed] Database already has data — skipping seed.")
    finally:
        db.close()
