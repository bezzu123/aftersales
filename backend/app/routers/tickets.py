from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, require_roles
from app.models.ticket import Ticket, TicketStatusHistory
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketOut, TicketListOut, StatusTransition
from app.services.ticket_service import can_transition, generate_ticket_number
from app.services.storage_service import save_image

router = APIRouter(prefix="/tickets", tags=["tickets"])


def _scope_query(q, user: User):
    if user.role == "store_staff":
        q = q.filter(Ticket.branch_id.in_(
            [b.id for b in (user.branch and [user.branch] or [])]
        ))
    elif user.role == "vendor":
        q = q.filter(Ticket.vendor_id == user.vendor_id)
    return q


@router.get("", response_model=list[TicketListOut])
def list_tickets(
    status: str | None = Query(None),
    bu: str | None = Query(None),
    branch_id: str | None = Query(None),
    vendor_id: str | None = Query(None),
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Ticket)
    if current_user.role == "store_staff" and current_user.branch_code:
        from app.models.branch import Branch
        branch = db.query(Branch).filter(Branch.branch_code == current_user.branch_code).first()
        if branch:
            q = q.filter(Ticket.branch_id == branch.id)
    elif current_user.role == "vendor":
        q = q.filter(Ticket.vendor_id == current_user.vendor_id)
    if status:
        q = q.filter(Ticket.status == status)
    if bu:
        q = q.filter(Ticket.bu == bu)
    if branch_id:
        q = q.filter(Ticket.branch_id == branch_id)
    if vendor_id:
        q = q.filter(Ticket.vendor_id == vendor_id)
    if start_date:
        q = q.filter(Ticket.ticket_date >= start_date)
    if end_date:
        q = q.filter(Ticket.ticket_date <= end_date)
    offset = (page - 1) * page_size
    return q.order_by(Ticket.created_at.desc()).offset(offset).limit(page_size).all()


@router.post("", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def create_ticket(
    body: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("store_staff", "admin")),
):
    ticket_number = generate_ticket_number(db, body.bu)
    ticket = Ticket(
        ticket_number=ticket_number,
        ticket_date=body.ticket_date if hasattr(body, "ticket_date") and body.ticket_date else date.today(),
        created_by=current_user.id,
        updated_by=current_user.id,
        **{k: v for k, v in body.model_dump().items() if k != "ticket_date"},
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/{ticket_id}", response_model=TicketOut)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if current_user.role == "vendor" and ticket.vendor_id != current_user.vendor_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return ticket


@router.patch("/{ticket_id}", response_model=TicketOut)
def update_ticket(
    ticket_id: str,
    body: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if current_user.role not in ("store_staff", "admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(ticket, field, value)
    ticket.updated_by = current_user.id
    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)
    return ticket


@router.patch("/{ticket_id}/status", response_model=TicketOut)
def transition_status(
    ticket_id: str,
    body: StatusTransition,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if not can_transition(ticket.status, body.status, current_user.role):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from '{ticket.status}' to '{body.status}' as '{current_user.role}'"
        )
    history = TicketStatusHistory(
        ticket_id=ticket.id,
        from_status=ticket.status,
        to_status=body.status,
        changed_by=current_user.id,
        note=body.note,
    )
    db.add(history)
    ticket.status = body.status
    ticket.status_changed_at = datetime.utcnow()
    if body.reject_reason:
        ticket.reject_reason = body.reject_reason
    ticket.updated_by = current_user.id
    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/image", response_model=TicketOut)
async def upload_image(
    ticket_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("store_staff", "admin")),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    url = await save_image(file)
    ticket.image_url = url
    ticket.updated_by = current_user.id
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/{ticket_id}/history")
def get_history(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    history = (
        db.query(TicketStatusHistory)
        .filter(TicketStatusHistory.ticket_id == ticket_id)
        .order_by(TicketStatusHistory.changed_at)
        .all()
    )
    return [
        {
            "id": h.id,
            "from_status": h.from_status,
            "to_status": h.to_status,
            "changed_by": h.user.full_name if h.user else h.changed_by,
            "changed_at": h.changed_at,
            "note": h.note,
        }
        for h in history
    ]
