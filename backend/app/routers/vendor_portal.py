from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_roles
from app.models.ticket import Ticket, TicketStatusHistory
from app.models.user import User
from app.schemas.ticket import TicketListOut, TicketOut

router = APIRouter(prefix="/vendor", tags=["vendor-portal"])


@router.get("/tickets", response_model=list[TicketListOut])
def vendor_tickets(
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("vendor")),
):
    q = db.query(Ticket).filter(Ticket.vendor_id == current_user.vendor_id)
    if status:
        q = q.filter(Ticket.status == status)
    offset = (page - 1) * page_size
    return q.order_by(Ticket.created_at.desc()).offset(offset).limit(page_size).all()


def _vendor_transition(ticket_id: str, new_status: str, note: str | None,
                        reject_reason: str | None, db: Session, current_user: User) -> Ticket:
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id, Ticket.vendor_id == current_user.vendor_id
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    history = TicketStatusHistory(
        ticket_id=ticket.id, from_status=ticket.status,
        to_status=new_status, changed_by=current_user.id, note=note,
    )
    db.add(history)
    ticket.status = new_status
    ticket.status_changed_at = datetime.utcnow()
    ticket.updated_by = current_user.id
    ticket.updated_at = datetime.utcnow()
    if reject_reason:
        ticket.reject_reason = reject_reason
    db.commit()
    db.refresh(ticket)
    return ticket


@router.patch("/tickets/{ticket_id}/accept", response_model=TicketOut)
def accept_ticket(ticket_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_roles("vendor"))):
    return _vendor_transition(ticket_id, "vendor_accepted", "Accepted by vendor", None, db, current_user)


@router.patch("/tickets/{ticket_id}/reject", response_model=TicketOut)
def reject_ticket(
    ticket_id: str,
    reject_reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("vendor")),
):
    return _vendor_transition(ticket_id, "vendor_rejected", None, reject_reason, db, current_user)


@router.patch("/tickets/{ticket_id}/update", response_model=TicketOut)
def update_repair_status(
    ticket_id: str,
    new_status: str,
    note: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("vendor")),
):
    allowed = {"in_repair", "repaired"}
    if new_status not in allowed:
        raise HTTPException(status_code=400, detail=f"Vendors can only set status to: {allowed}")
    return _vendor_transition(ticket_id, new_status, note, None, db, current_user)
