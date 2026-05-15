from datetime import date
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.ticket import Ticket

# ---------------------------------------------------------------------------
# MVP State Machine
# ---------------------------------------------------------------------------
# Three repair channel flows:
#   in-store  : waiting_repair → repaired_pickup → completed
#   vendor-store : sent_vendor → repaired_pickup → completed
#   vendor-bdc   : pending_gr → pending_bdc → received_bdc → sent_vendor → repaired_pickup → completed
#
# Re-repair loop: repaired_pickup → re_repair → [waiting_repair | sent_vendor]
# Cancel/Donate: any active status → pending_cancel/pending_donate → cancelled/donated (DSM)
# ---------------------------------------------------------------------------

# Allowed next statuses from each status
TRANSITIONS: dict[str, list[str]] = {
    "waiting_repair":  ["repaired_pickup", "pending_cancel", "pending_donate"],
    "pending_gr":      ["pending_bdc", "pending_cancel"],
    "pending_bdc":     ["received_bdc", "pending_cancel"],
    "received_bdc":    ["sent_vendor", "pending_cancel"],
    "sent_vendor":     ["repaired_pickup", "pending_cancel"],
    "repaired_pickup": ["completed", "re_repair"],
    "re_repair":       ["waiting_repair", "sent_vendor", "pending_cancel"],
    "pending_cancel":  ["cancelled"],
    "pending_donate":  ["donated"],
    "completed": [],
    "cancelled": [],
    "donated":   [],
}

# Roles that are allowed to trigger each target status
ROLE_TRANSITIONS: dict[str, list[str]] = {
    # PC / store staff actions
    "repaired_pickup": ["pc", "admin"],    # PC marks: received item from tech / vendor
    "completed":       ["pc", "admin"],    # PC marks: customer picked up
    "re_repair":       ["pc", "admin"],    # PC requests re-repair
    "pending_cancel":  ["pc", "admin"],    # PC requests cancel approval from DSM
    "pending_donate":  ["pc", "admin"],    # PC requests donate approval from DSM
    "waiting_repair":  ["pc", "admin"],    # PC restarts in-store repair (re-repair path)
    # GR actions
    "pending_bdc":     ["gr", "admin"],    # GR ships item to BDC
    # BDC actions
    "received_bdc":    ["bdc", "admin"],   # BDC confirms receipt of item
    "sent_vendor":     ["bdc", "pc", "admin"],  # BDC sends to vendor (vendor-bdc) OR PC (vendor-store)
    # DSM actions
    "cancelled":       ["dsm", "admin"],   # DSM approves cancellation
    "donated":         ["dsm", "admin"],   # DSM approves donation
}

# Initial status to auto-assign on ticket creation per repair channel
CHANNEL_INITIAL_STATUS: dict[str, str] = {
    "in-store":    "waiting_repair",
    "vendor-store": "sent_vendor",
    "vendor-bdc":  "pending_gr",
}


def can_transition(current: str, target: str, role: str) -> bool:
    if target not in TRANSITIONS.get(current, []):
        return False
    allowed_roles = ROLE_TRANSITIONS.get(target, [])
    return role in allowed_roles


def initial_status_for_channel(repair_channel: str | None) -> str:
    """Return the correct initial status for the ticket's repair channel."""
    return CHANNEL_INITIAL_STATUS.get(repair_channel or "in-store", "waiting_repair")


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
