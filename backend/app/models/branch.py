import uuid
from sqlalchemy import String, Boolean, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Branch(Base):
    __tablename__ = "branches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    branch_name: Mapped[str] = mapped_column(String(200), nullable=False)
    bu: Mapped[str] = mapped_column(SAEnum("CDS", "RBS", name="bu_enum"), nullable=False)
    region: Mapped[str | None] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    users: Mapped[list["User"]] = relationship("User", back_populates="branch")
    tickets: Mapped[list["Ticket"]] = relationship("Ticket", back_populates="branch")
