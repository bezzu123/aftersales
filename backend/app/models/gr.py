import uuid
from datetime import datetime, date
from sqlalchemy import String, DateTime, Date, Integer, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

GR_STATUSES = ("created", "in_transit", "received", "rejected")


class GoodsReturn(Base):
    __tablename__ = "goods_returns"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    gr_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    ticket_id: Mapped[str] = mapped_column(String(36), ForeignKey("tickets.id"), nullable=False)

    return_date: Mapped[date] = mapped_column(Date, nullable=False)
    carrier_name: Mapped[str | None] = mapped_column(String(200))
    tracking_no: Mapped[str | None] = mapped_column(String(100))
    package_condition: Mapped[str | None] = mapped_column(String(200))
    items_count: Mapped[int] = mapped_column(Integer, default=1)

    vendor_received_at: Mapped[datetime | None] = mapped_column(DateTime)
    vendor_received_by: Mapped[str | None] = mapped_column(String(200))

    status: Mapped[str] = mapped_column(
        SAEnum(*GR_STATUSES, name="gr_status_enum"), nullable=False, default="created"
    )
    remark: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))

    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="goods_returns")
    damage_controls: Mapped[list["DamageControl"]] = relationship("DamageControl", back_populates="gr")
