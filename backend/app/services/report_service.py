import io
from datetime import date
from sqlalchemy.orm import Session
import pandas as pd
from app.models.ticket import Ticket
from app.models.gr import GoodsReturn
from app.models.dc import DamageControl


def _ticket_query(db: Session, start: date, end: date, filters: dict):
    q = db.query(Ticket).filter(Ticket.ticket_date >= start, Ticket.ticket_date <= end)
    if filters.get("bu"):
        q = q.filter(Ticket.bu == filters["bu"])
    if filters.get("status"):
        q = q.filter(Ticket.status == filters["status"])
    if filters.get("branch_id"):
        q = q.filter(Ticket.branch_id == filters["branch_id"])
    if filters.get("vendor_id"):
        q = q.filter(Ticket.vendor_id == filters["vendor_id"])
    return q.all()


def export_tickets_excel(db: Session, start: date, end: date, filters: dict) -> bytes:
    tickets = _ticket_query(db, start, end, filters)
    rows = []
    for t in tickets:
        rows.append({
            "Ticket Number": t.ticket_number,
            "Date": t.ticket_date,
            "BU": t.bu,
            "Branch": t.branch_id,
            "Staff Name": t.staff_name,
            "Staff Phone": t.staff_phone,
            "Product Type": t.product_type,
            "Product Brand": t.product_brand,
            "Serial No": t.serial_no,
            "Customer Name": t.customer_name,
            "Customer Phone": t.customer_phone,
            "Customer Email": t.customer_email,
            "Repair Detail": t.repair_detail,
            "Repair Cost": t.repair_cost,
            "Repair Channel": t.repair_channel,
            "Cost Type": t.cost_type,
            "Warranty No": t.warranty_no,
            "Status": t.status,
            "Vendor": t.vendor_id,
            "Pickup Date": t.pickup_date,
            "Processing Date": t.processing_date,
            "Reject Reason": t.reject_reason,
            "Remark": t.remark,
            "Created At": t.created_at,
        })
    df = pd.DataFrame(rows)
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Tickets")
    return buf.getvalue()


def export_tickets_csv(db: Session, start: date, end: date, filters: dict) -> str:
    tickets = _ticket_query(db, start, end, filters)
    rows = [
        {
            "Ticket Number": t.ticket_number,
            "Date": t.ticket_date,
            "BU": t.bu,
            "Status": t.status,
            "Customer Name": t.customer_name,
            "Product Type": t.product_type,
            "Product Brand": t.product_brand,
            "Repair Cost": t.repair_cost,
        }
        for t in tickets
    ]
    return pd.DataFrame(rows).to_csv(index=False)
