from datetime import date
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.ticket import Ticket

# Allowed transitions: {current_status: [allowed_next_statuses]}
TRANSITIONS: dict[str, list[str]] = {
    "draft": ["pending_gr", "sent_to_vendor", "cancelled"],
    "pending_gr": ["gr_created", "cancelled"],
    "gr_created": ["sent_to_vendor", "cancelled"],
    "sent_to_vendor": ["vendor_accepted", "vendor_rejected"],
    "vendor_accepted": ["in_repair"],
    "vendor_rejected": ["pending_gr", "cancelled"],
    "in_repair": ["repaired"],
    "repaired": ["ready_pickup", "pending_dc"],
    "pending_dc": ["dc_created"],
    "dc_created": ["ready_pickup", "cancelled"],
    "ready_pickup": ["completed"],
    "completed": [],
    "cancelled": [],
}

# Roles allowed to trigger each transition target status
ROLE_TRANSITIONS: dict[str, list[str]] = {
    "pending_gr": ["store_staff", "admin"],
    "gr_created": ["store_staff", "admin"],
    "sent_to_vendor": ["store_staff", "admin"],
    "vendor_accepted": ["vendor", "admin"],
    "vendor_rejected": ["vendor", "admin"],
    "in_repair": ["vendor", "admin"],
    "repaired": ["vendor", "admin"],
    "ready_pickup": ["store_staff", "admin"],
    "pending_dc": ["store_staff", "admin"],
    "dc_created": ["store_staff", "admin"],
    "completed": ["store_staff", "admin"],
    "cancelled": ["store_staff", "admin"],
}


def can_transition(current: str, target: str, role: str) -> bool:
    if target not in TRANSITIONS.get(current, []):
        return False
    allowed_roles = ROLE_TRANSITIONS.get(target, [])
    return role in allowed_roles


def generate_ticket_number(db: Session, bu: str) -> str:
    today = date.today().strftime("%Y%m%d")
    prefix = f"{bu}-{today}-"
    count = db.query(func.count(Ticket.id)).filter(Ticket.ticket_number.like(f"{prefix}%")).scalar() or 0
    return f"{prefix}{(count + 1):05d}"


def generate_gr_number(db: Session) -> str:
    from app.models.gr import GoodsReturn
    today = date.today().strftime("%Y%m%d")
    prefix = f"GR-{today}-"
    count = db.query(func.count(GoodsReturn.id)).filter(GoodsReturn.gr_number.like(f"{prefix}%")).scalar() or 0
    return f"{prefix}{(count + 1):05d}"


def generate_dc_number(db: Session) -> str:
    from app.models.dc import DamageControl
    today = date.today().strftime("%Y%m%d")
    prefix = f"DC-{today}-"
    count = db.query(func.count(DamageControl.id)).filter(DamageControl.dc_number.like(f"{prefix}%")).scalar() or 0
    return f"{prefix}{(count + 1):05d}"
