from datetime import date, datetime
from pydantic import BaseModel


class TicketCreate(BaseModel):
    bu: str
    branch_id: str | None = None
    staff_name: str | None = None
    staff_phone: str | None = None
    sub_dept_code: str | None = None
    product_type: str | None = None
    product_brand: str | None = None
    serial_no: str | None = None
    repair_detail: str | None = None
    repair_cost: float | None = None
    repair_cost_tbd: bool = False
    repair_channel: str | None = None
    customer_name: str | None = None
    customer_phone: str | None = None
    customer_email: str | None = None
    warranty_no: str | None = None
    warranty_desc: str | None = None
    cost_type: str | None = None
    cost_desc: str | None = None
    remark: str | None = None
    pickup_date: date | None = None
    processing_date: date | None = None


class TicketUpdate(BaseModel):
    staff_name: str | None = None
    staff_phone: str | None = None
    sub_dept_code: str | None = None
    product_type: str | None = None
    product_brand: str | None = None
    serial_no: str | None = None
    repair_detail: str | None = None
    repair_cost: float | None = None
    repair_cost_tbd: bool | None = None
    repair_channel: str | None = None
    customer_name: str | None = None
    customer_phone: str | None = None
    customer_email: str | None = None
    warranty_no: str | None = None
    warranty_desc: str | None = None
    vendor_id: str | None = None
    cost_type: str | None = None
    cost_desc: str | None = None
    reject_reason: str | None = None
    remark: str | None = None
    pickup_date: date | None = None
    processing_date: date | None = None


class StatusTransition(BaseModel):
    status: str
    note: str | None = None
    reject_reason: str | None = None


class TicketOut(BaseModel):
    id: str
    ticket_number: str
    ticket_date: date
    bu: str
    branch_id: str | None
    staff_name: str | None
    staff_phone: str | None
    sub_dept_code: str | None
    product_type: str | None
    product_brand: str | None
    serial_no: str | None
    repair_detail: str | None
    repair_cost: float | None
    repair_cost_tbd: bool
    repair_channel: str | None
    image_url: str | None
    customer_name: str | None
    customer_phone: str | None
    customer_email: str | None
    warranty_no: str | None
    warranty_desc: str | None
    vendor_id: str | None
    status: str
    cost_type: str | None
    cost_desc: str | None
    reject_reason: str | None
    remark: str | None
    pickup_date: date | None
    processing_date: date | None
    status_changed_at: datetime
    created_at: datetime
    created_by: str | None
    updated_at: datetime
    updated_by: str | None

    class Config:
        from_attributes = True


class TicketListOut(BaseModel):
    id: str
    ticket_number: str
    ticket_date: date
    bu: str
    status: str
    repair_channel: str | None
    product_type: str | None
    product_brand: str | None
    customer_name: str | None
    staff_name: str | None
    branch_id: str | None
    vendor_id: str | None
    created_at: datetime
    status_changed_at: datetime

    class Config:
        from_attributes = True
