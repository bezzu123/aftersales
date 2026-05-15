from datetime import date, datetime
from pydantic import BaseModel


class GRCreate(BaseModel):
    ticket_id: str
    return_date: date
    carrier_name: str | None = None
    tracking_no: str | None = None
    package_condition: str | None = None
    items_count: int = 1
    remark: str | None = None


class GRUpdate(BaseModel):
    carrier_name: str | None = None
    tracking_no: str | None = None
    package_condition: str | None = None
    items_count: int | None = None
    remark: str | None = None
    status: str | None = None


class GRReceived(BaseModel):
    vendor_received_by: str | None = None
    remark: str | None = None


class GROut(BaseModel):
    id: str
    gr_number: str
    ticket_id: str
    return_date: date
    carrier_name: str | None
    tracking_no: str | None
    package_condition: str | None
    items_count: int
    vendor_received_at: datetime | None
    vendor_received_by: str | None
    status: str
    remark: str | None
    created_at: datetime
    created_by: str | None
    updated_at: datetime
    updated_by: str | None

    class Config:
        from_attributes = True
