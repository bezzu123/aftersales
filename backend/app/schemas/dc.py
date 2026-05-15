from datetime import date, datetime
from pydantic import BaseModel


class DCCreate(BaseModel):
    gr_id: str
    ticket_id: str
    assessment_date: date
    damage_type: str | None = None
    damage_description: str | None = None
    assessed_by: str | None = None
    resolution_type: str
    credit_amount: float | None = None
    credit_note_no: str | None = None
    consignment_ref: str | None = None
    remark: str | None = None


class DCUpdate(BaseModel):
    damage_type: str | None = None
    damage_description: str | None = None
    assessed_by: str | None = None
    resolution_type: str | None = None
    credit_amount: float | None = None
    credit_note_no: str | None = None
    consignment_ref: str | None = None
    remark: str | None = None
    status: str | None = None


class DCOut(BaseModel):
    id: str
    dc_number: str
    gr_id: str
    ticket_id: str
    assessment_date: date
    damage_type: str | None
    damage_description: str | None
    assessed_by: str | None
    resolution_type: str
    credit_amount: float | None
    credit_note_no: str | None
    consignment_ref: str | None
    status: str
    remark: str | None
    created_at: datetime
    created_by: str | None
    updated_at: datetime
    updated_by: str | None

    class Config:
        from_attributes = True
