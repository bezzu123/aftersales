from datetime import datetime
from pydantic import BaseModel


class VendorCreate(BaseModel):
    vendor_code: str
    vendor_name: str
    contact_name: str | None = None
    contact_phone: str | None = None
    contact_email: str | None = None
    product_types: str | None = None


class VendorUpdate(BaseModel):
    vendor_name: str | None = None
    contact_name: str | None = None
    contact_phone: str | None = None
    contact_email: str | None = None
    product_types: str | None = None
    is_active: bool | None = None


class VendorOut(BaseModel):
    id: str
    vendor_code: str
    vendor_name: str
    contact_name: str | None
    contact_phone: str | None
    contact_email: str | None
    product_types: str | None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
