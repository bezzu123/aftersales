import uuid
from datetime import datetime, date
from sqlalchemy import String, DateTime, Date, Numeric, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

DC_STATUSES = ("open", "pending_approval", "approved", "closed")
RESOLUTION_TYPES = ("credit_note", "consignment", "replacement", "no_action")


class DamageControl(Base):
    __tablename__ = "damage_controls"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dc_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    gr_id: Mapped[str] = mapped_column(String(36), ForeignKey("goods_returns.id"), nullable=False)
    ticket_id: Mapped[str] = mapped_column(String(36), ForeignKey("tickets.id"), nullable=False)

    assessment_date: Mapped[date] = mapped_column(Date, nullable=False)
    damage_type: Mapped[str | None] = mapped_column(String(200))
    damage_description: Mapped[str | None] = mapped_column(Text)
    assessed_by: Mapped[str | None] = mapped_column(String(200))

    resolution_type: Mapped[str] = mapped_column(
        SAEnum(*RESOLUTION_TYPES, name="resolution_type_enum"), nullable=False
    )
    credit_amount: Mapped[float | None] = mapped_column(Numeric(12, 2))
    credit_note_no: Mapped[str | None] = mapped_column(String(100))
    consignment_ref: Mapped[str | None] = mapped_column(String(100))

    status: Mapped[str] = mapped_column(
        SAEnum(*DC_STATUSES, name="dc_status_enum"), nullable=False, default="open"
    )
    remark: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))

    gr: Mapped["GoodsReturn"] = relationship("GoodsReturn", back_populates="damage_controls")
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="damage_controls")
