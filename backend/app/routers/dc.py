from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, require_roles
from app.models.dc import DamageControl
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.dc import DCCreate, DCUpdate, DCOut
from app.services.ticket_service import generate_dc_number

router = APIRouter(prefix="/dc", tags=["damage-control"])


@router.get("", response_model=list[DCOut])
def list_dc(
    ticket_id: str | None = Query(None),
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("dsm", "admin")),
):
    q = db.query(DamageControl)
    if ticket_id:
        q = q.filter(DamageControl.ticket_id == ticket_id)
    if status:
        q = q.filter(DamageControl.status == status)
    offset = (page - 1) * page_size
    return q.order_by(DamageControl.created_at.desc()).offset(offset).limit(page_size).all()


@router.post("", response_model=DCOut, status_code=status.HTTP_201_CREATED)
def create_dc(
    body: DCCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("bdc", "dsm", "admin")),
):
    dc = DamageControl(
        dc_number=generate_dc_number(db),
        created_by=current_user.id,
        updated_by=current_user.id,
        **body.model_dump(),
    )
    db.add(dc)
    ticket = db.query(Ticket).filter(Ticket.id == body.ticket_id).first()
    if ticket:
        ticket.status = "pending_bdc"
        ticket.updated_by = current_user.id
    db.commit()
    db.refresh(dc)
    return dc


@router.get("/{dc_id}", response_model=DCOut)
def get_dc(dc_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_roles("dsm", "bdc", "admin"))):
    dc = db.query(DamageControl).filter(DamageControl.id == dc_id).first()
    if not dc:
        raise HTTPException(status_code=404, detail="DC not found")
    return dc


@router.patch("/{dc_id}", response_model=DCOut)
def update_dc(
    dc_id: str,
    body: DCUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    dc = db.query(DamageControl).filter(DamageControl.id == dc_id).first()
    if not dc:
        raise HTTPException(status_code=404, detail="DC not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(dc, field, value)
    dc.updated_by = current_user.id
    dc.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(dc)
    return dc


@router.patch("/{dc_id}/approve", response_model=DCOut)
def approve_dc(
    dc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    dc = db.query(DamageControl).filter(DamageControl.id == dc_id).first()
    if not dc:
        raise HTTPException(status_code=404, detail="DC not found")
    dc.status = "approved"
    dc.updated_by = current_user.id
    dc.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(dc)
    return dc
