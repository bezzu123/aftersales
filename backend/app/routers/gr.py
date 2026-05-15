from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, require_roles
from app.models.gr import GoodsReturn
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.gr import GRCreate, GRUpdate, GRReceived, GROut
from app.services.ticket_service import generate_gr_number

router = APIRouter(prefix="/gr", tags=["goods-return"])


@router.get("", response_model=list[GROut])
def list_gr(
    ticket_id: str | None = Query(None),
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(GoodsReturn)
    if ticket_id:
        q = q.filter(GoodsReturn.ticket_id == ticket_id)
    if status:
        q = q.filter(GoodsReturn.status == status)
    offset = (page - 1) * page_size
    return q.order_by(GoodsReturn.created_at.desc()).offset(offset).limit(page_size).all()


@router.post("", response_model=GROut, status_code=status.HTTP_201_CREATED)
def create_gr(
    body: GRCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("gr", "admin")),
):
    ticket = db.query(Ticket).filter(Ticket.id == body.ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    gr = GoodsReturn(
        gr_number=generate_gr_number(db),
        created_by=current_user.id,
        updated_by=current_user.id,
        **body.model_dump(),
    )
    db.add(gr)
    ticket.status = "pending_bdc"
    ticket.updated_by = current_user.id
    db.commit()
    db.refresh(gr)
    return gr


@router.get("/{gr_id}", response_model=GROut)
def get_gr(gr_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    gr = db.query(GoodsReturn).filter(GoodsReturn.id == gr_id).first()
    if not gr:
        raise HTTPException(status_code=404, detail="GR not found")
    return gr


@router.patch("/{gr_id}", response_model=GROut)
def update_gr(
    gr_id: str,
    body: GRUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    gr = db.query(GoodsReturn).filter(GoodsReturn.id == gr_id).first()
    if not gr:
        raise HTTPException(status_code=404, detail="GR not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(gr, field, value)
    gr.updated_by = current_user.id
    gr.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(gr)
    return gr


@router.patch("/{gr_id}/received", response_model=GROut)
def mark_received(
    gr_id: str,
    body: GRReceived,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("bdc", "admin")),
):
    gr = db.query(GoodsReturn).filter(GoodsReturn.id == gr_id).first()
    if not gr:
        raise HTTPException(status_code=404, detail="GR not found")
    gr.status = "received"
    gr.vendor_received_at = datetime.utcnow()
    gr.vendor_received_by = body.vendor_received_by
    if body.remark:
        gr.remark = body.remark
    gr.updated_by = current_user.id
    gr.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(gr)
    return gr
