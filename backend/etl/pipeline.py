import io
import math
import pandas as pd
from sqlalchemy.orm import Session
from models import HistoricalTicket

CATEGORY_MAP = {
    "vpn": "VPN Issue",
    "vpn issue": "VPN Issue",
    "vpn problem": "VPN Issue",
    "vpn access": "VPN Issue",
    "password": "Password Reset",
    "password reset": "Password Reset",
    "pwd reset": "Password Reset",
    "reset password": "Password Reset",
    "software": "Software Installation",
    "software installation": "Software Installation",
    "software install": "Software Installation",
    "install software": "Software Installation",
    "software request": "Software Installation",
    "laptop": "Laptop Issue",
    "laptop issue": "Laptop Issue",
    "laptop problem": "Laptop Issue",
    "hardware laptop": "Laptop Issue",
    "email": "Email Access",
    "email access": "Email Access",
    "email issue": "Email Access",
    "mail access": "Email Access",
    "email problem": "Email Access",
    "network": "Network Connectivity",
    "network connectivity": "Network Connectivity",
    "network issue": "Network Connectivity",
    "connectivity": "Network Connectivity",
    "internet": "Network Connectivity",
    "hardware": "Hardware Request",
    "hardware request": "Hardware Request",
    "hardware issue": "Hardware Request",
    "equipment request": "Hardware Request",
}

PRIORITY_MAP = {
    "low": "Low",
    "l": "Low",
    "1": "Low",
    "minor": "Low",
    "medium": "Medium",
    "med": "Medium",
    "normal": "Medium",
    "m": "Medium",
    "2": "Medium",
    "moderate": "Medium",
    "high": "High",
    "h": "High",
    "3": "High",
    "important": "High",
    "critical": "Critical",
    "crit": "Critical",
    "urgent": "Critical",
    "4": "Critical",
    "emergency": "Critical",
}

STATUS_MAP = {
    "open": "Open",
    "new": "Open",
    "pending": "Open",
    "submitted": "Open",
    "in progress": "In Progress",
    "inprogress": "In Progress",
    "in-progress": "In Progress",
    "wip": "In Progress",
    "working": "In Progress",
    "processing": "In Progress",
    "resolved": "Resolved",
    "done": "Resolved",
    "fixed": "Resolved",
    "complete": "Resolved",
    "completed": "Resolved",
    "closed": "Closed",
    "close": "Closed",
    "cancelled": "Closed",
}


def extract(file_bytes: bytes) -> pd.DataFrame:
    df = pd.read_csv(io.BytesIO(file_bytes))
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    return df


def transform(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    for col in ["employee_name", "department", "issue_category", "status", "priority"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    df["issue_category"] = df["issue_category"].apply(
        lambda x: CATEGORY_MAP.get(x.lower(), x.title())
    )
    df["priority"] = df["priority"].apply(
        lambda x: PRIORITY_MAP.get(x.lower(), "Medium")
    )
    df["status"] = df["status"].apply(
        lambda x: STATUS_MAP.get(x.lower().strip(), "Open")
    )
    df["department"] = df["department"].str.title()

    df["created_date"] = pd.to_datetime(df["created_date"], errors="coerce")
    df["resolved_date"] = pd.to_datetime(
        df.get("resolved_date", pd.Series([None] * len(df))), errors="coerce"
    )

    df["resolution_days"] = (
        (df["resolved_date"] - df["created_date"]).dt.total_seconds() / 86400
    )
    mask_unresolved = df["status"].isin(["Open", "In Progress"])
    df.loc[mask_unresolved, "resolution_days"] = None

    df = df.dropna(subset=["employee_name", "issue_category", "created_date"])
    df = df[df["employee_name"].str.strip() != ""]
    df = df[df["employee_name"] != "nan"]

    return df


def deduplicate(df: pd.DataFrame) -> tuple:
    before = len(df)

    df = df.copy()
    df["_dedup_name"] = df["employee_name"].str.lower().str.strip()
    df["_dedup_cat"] = df["issue_category"].str.lower().str.strip()
    df["_dedup_date"] = df["created_date"].dt.date

    df = df.drop_duplicates(
        subset=["_dedup_name", "_dedup_cat", "_dedup_date"],
        keep="first",
    )
    df = df.drop(columns=["_dedup_name", "_dedup_cat", "_dedup_date"])

    return df, before - len(df)


def load(df: pd.DataFrame, db: Session) -> int:
    db.query(HistoricalTicket).delete()
    db.commit()

    records = []
    for _, row in df.iterrows():
        resolution_days = row.get("resolution_days")
        if resolution_days is not None:
            try:
                val = float(resolution_days)
                resolution_days = None if math.isnan(val) else val
            except (TypeError, ValueError):
                resolution_days = None

        record = HistoricalTicket(
            employee_name=str(row["employee_name"]),
            department=str(row["department"]),
            issue_category=str(row["issue_category"]),
            status=str(row["status"]),
            priority=str(row["priority"]),
            created_date=row["created_date"].date() if pd.notna(row["created_date"]) else None,
            resolved_date=row["resolved_date"].date() if pd.notna(row.get("resolved_date")) else None,
            resolution_days=resolution_days,
        )
        records.append(record)

    db.bulk_save_objects(records)
    db.commit()
    return len(records)


def run_pipeline(file_bytes: bytes, db: Session) -> dict:
    raw_df = extract(file_bytes)
    rows_extracted = len(raw_df)

    transformed_df = transform(raw_df)
    rows_dropped_transform = rows_extracted - len(transformed_df)

    clean_df, rows_deduplicated = deduplicate(transformed_df)

    rows_loaded = load(clean_df, db)

    return {
        "rows_extracted": rows_extracted,
        "rows_dropped_transform": rows_dropped_transform,
        "rows_deduplicated": rows_deduplicated,
        "rows_loaded": rows_loaded,
    }
