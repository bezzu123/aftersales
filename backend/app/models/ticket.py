import uuid
from datetime import datetime, date
from sqlalchemy import String, Boolean, DateTime, Date, Numeric, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

TICKET_STATUSES = (
    "draft", "pending_gr", "gr_created", "sent_to_vendor",
    "vendor_accepted", "vendor_rejected", "in_repair", "repaired",
    "pending_dc", "dc_created", "ready_pickup", "completed", "cancelled",
)


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    ticket_date: Mapped[date] = mapped_column(Date, nullable=False)
    bu: Mapped[str] = mapped_column(SAEnum("CDS", "RBS", name="ticket_bu_enum"), nullable=False)
    branch_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("branches.id"), nullable=True)

    # Staff
    staff_name: Mapped[str | None] = mapped_column(String(200))
    staff_phone: Mapped[str | None] = mapped_column(String(50))
    sub_dept_code: Mapped[str | None] = mapped_column(String(50))

    # Product
    product_type: Mapped[str | None] = mapped_column(String(100))
    product_brand: Mapped[str | None] = mapped_column(String(100))
    serial_no: Mapped[str | None] = mapped_column(String(100))
    repair_detail: Mapped[str | None] = mapped_column(Text)
    repair_cost: Mapped[float | None] = mapped_column(Numeric(12, 2))
    repair_channel: Mapped[str | None] = mapped_column(SAEnum("in-store", "send-out", name="repair_channel_enum"))
    image_url: Mapped[str | None] = mapped_column(String(500))

    # Customer
    customer_name: Mapped[str | None] = mapped_column(String(200))
    customer_phone: Mapped[str | None] = mapped_column(String(50))
    customer_email: Mapped[str | None] = mapped_column(String(200))

    # Warranty
    warranty_no: Mapped[str | None] = mapped_column(String(100))
    warranty_desc: Mapped[str | None] = mapped_column(Text)

    # Assignment
    vendor_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("vendors.id"), nullable=True)

    # Status & costs
    status: Mapped[str] = mapped_column(
        SAEnum(*TICKET_STATUSES, name="ticket_status_enum"), nullable=False, default="draft"
    )
    cost_type: Mapped[str | None] = mapped_column(SAEnum("warranty", "chargeable", "goodwill", name="cost_type_enum"))
    cost_desc: Mapped[str | None] = mapped_column(Text)
    reject_reason: Mapped[str | None] = mapped_column(Text)
    remark: Mapped[str | None] = mapped_column(Text)

    # Dates
    pickup_date: Mapped[date | None] = mapped_column(Date)
    processing_date: Mapped[date | None] = mapped_column(Date)
    status_changed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Audit
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))

    branch: Mapped["Branch | None"] = relationship("Branch", back_populates="tickets")
    vendor: Mapped["Vendor | None"] = relationship("Vendor", back_populates="tickets")
    status_history: Mapped[list["TicketStatusHistory"]] = relationship(
        "TicketStatusHistory", back_populates="ticket", order_by="TicketStatusHistory.changed_at"
    )
    goods_returns: Mapped[list["GoodsReturn"]] = relationship("GoodsReturn", back_populates="ticket")
    damage_controls: Mapped[list["DamageControl"]] = relationship("DamageControl", back_populates="ticket")


class TicketStatusHistory(Base):
    __tablename__ = "ticket_status_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id: Mapped[str] = mapped_column(String(36), ForeignKey("tickets.id"), nullable=False)
    from_status: Mapped[str | None] = mapped_column(String(50))
    to_status: Mapped[str] = mapped_column(String(50), nullable=False)
    changed_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))
    changed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    note: Mapped[str | None] = mapped_column(Text)

    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="status_history")
    user: Mapped["User | None"] = relationship("User", foreign_keys=[changed_by])
