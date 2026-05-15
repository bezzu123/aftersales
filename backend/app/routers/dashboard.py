from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_roles
from app.models.ticket import Ticket
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def summary(db: Session = Depends(get_db), current_user: User = Depends(require_roles("dsm", "admin"))):
    rows = db.query(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status).all()
    by_status = {r[0]: r[1] for r in rows}
    total = sum(by_status.values())

    bu_rows = db.query(Ticket.bu, func.count(Ticket.id)).group_by(Ticket.bu).all()
    channel_rows = db.query(Ticket.repair_channel, func.count(Ticket.id)).group_by(Ticket.repair_channel).all()

    # MVP alert counts
    alerts = {
        "pending_gr_count":     by_status.get("pending_gr", 0),      # waiting for GR to ship
        "pending_bdc_count":    by_status.get("pending_bdc", 0),      # waiting at BDC
        "sent_vendor_count":    by_status.get("sent_vendor", 0),      # with vendor
        "repaired_pickup_count": by_status.get("repaired_pickup", 0), # ready for customer
        "re_repair_count":      by_status.get("re_repair", 0),        # re-repair items
        "pending_approval_count": (
            by_status.get("pending_cancel", 0) + by_status.get("pending_donate", 0)
        ),  # waiting DSM approval
    }

    return {
        "total": total,
        "by_status": by_status,
        "by_bu": {r[0]: r[1] for r in bu_rows},
        "by_channel": {r[0]: r[1] for r in channel_rows},
        "alerts": alerts,
    }


@router.get("/repair-time")
def repair_time(db: Session = Depends(get_db), current_user: User = Depends(require_roles("dsm", "admin"))):
    """Average repair time (pickup_date - processing_date) grouped by repair channel."""
    rows = (
        db.query(
            Ticket.repair_channel,
            func.avg(
                func.julianday(Ticket.pickup_date) - func.julianday(Ticket.processing_date)
            ).label("avg_days"),
            func.count(Ticket.id).label("count"),
        )
        .filter(Ticket.pickup_date.isnot(None), Ticket.processing_date.isnot(None))
        .group_by(Ticket.repair_channel)
        .all()
    )
    return [
        {"channel": r.repair_channel, "avg_days": round(r.avg_days or 0, 1), "count": r.count}
        for r in rows
    ]


@router.get("/status-aging")
def status_aging(db: Session = Depends(get_db), current_user: User = Depends(require_roles("dsm", "admin"))):
    """Active tickets with days in current status — highlights backlog."""
    active_statuses = [
        "waiting_repair", "pending_gr", "pending_bdc",
        "received_bdc", "sent_vendor", "repaired_pickup",
        "re_repair", "pending_cancel", "pending_donate",
    ]
    rows = db.query(
        Ticket.status,
        Ticket.ticket_number,
        Ticket.repair_channel,
        Ticket.status_changed_at,
        func.julianday(func.now()) - func.julianday(Ticket.status_changed_at),
    ).filter(Ticket.status.in_(active_statuses)).order_by(Ticket.status_changed_at).limit(100).all()
    return [
        {
            "status": r[0],
            "ticket_number": r[1],
            "channel": r[2],
            "since": str(r[3]),
            "days_in_status": round(r[4] or 0, 1),
        }
        for r in rows
    ]
