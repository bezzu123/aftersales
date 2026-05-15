from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, case
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
    return {
        "total": total,
        "by_status": by_status,
        "by_bu": {r[0]: r[1] for r in bu_rows},
    }


@router.get("/repair-time")
def repair_time(db: Session = Depends(get_db), current_user: User = Depends(require_roles("dsm", "admin"))):
    rows = (
        db.query(
            Ticket.vendor_id,
            func.avg(
                func.julianday(Ticket.pickup_date) - func.julianday(Ticket.processing_date)
            ).label("avg_days"),
            func.count(Ticket.id).label("count"),
        )
        .filter(Ticket.pickup_date.isnot(None), Ticket.processing_date.isnot(None))
        .group_by(Ticket.vendor_id)
        .all()
    )
    return [
        {"vendor_id": r.vendor_id, "avg_days": round(r.avg_days or 0, 1), "count": r.count}
        for r in rows
    ]


@router.get("/vendor-performance")
def vendor_performance(db: Session = Depends(get_db), current_user: User = Depends(require_roles("dsm", "admin"))):
    rows = (
        db.query(
            Ticket.vendor_id,
            func.count(Ticket.id).label("total"),
            func.sum(case((Ticket.status == "vendor_accepted", 1), else_=0)).label("accepted"),
            func.sum(case((Ticket.status == "vendor_rejected", 1), else_=0)).label("rejected"),
        )
        .filter(Ticket.vendor_id.isnot(None))
        .group_by(Ticket.vendor_id)
        .all()
    )
    return [
        {
            "vendor_id": r.vendor_id,
            "total": r.total,
            "accepted": r.accepted,
            "rejected": r.rejected,
            "accept_rate": round((r.accepted / r.total) * 100, 1) if r.total else 0,
        }
        for r in rows
    ]


@router.get("/status-aging")
def status_aging(db: Session = Depends(get_db), current_user: User = Depends(require_roles("dsm", "admin"))):
    rows = db.query(
        Ticket.status,
        Ticket.ticket_number,
        Ticket.status_changed_at,
        func.julianday(func.now()) - func.julianday(Ticket.status_changed_at),
    ).filter(Ticket.status.notin_(["completed", "cancelled"])).order_by(Ticket.status_changed_at).limit(100).all()
    return [
        {"status": r[0], "ticket_number": r[1], "since": str(r[2]), "days_in_status": round(r[3] or 0, 1)}
        for r in rows
    ]
