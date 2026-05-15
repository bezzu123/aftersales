from datetime import date
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse, Response
import io
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_roles
from app.models.user import User
from app.services.report_service import export_tickets_excel, export_tickets_csv

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/tickets")
def report_tickets(
    start_date: date = Query(...),
    end_date: date = Query(...),
    format: str = Query("excel", pattern="^(excel|csv)$"),
    bu: str | None = Query(None),
    status: str | None = Query(None),
    branch_id: str | None = Query(None),
    vendor_id: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("dsm", "admin")),
):
    filters = {"bu": bu, "status": status, "branch_id": branch_id, "vendor_id": vendor_id}
    if format == "excel":
        data = export_tickets_excel(db, start_date, end_date, filters)
        return Response(
            content=data,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=tickets_{start_date}_{end_date}.xlsx"},
        )
    else:
        data = export_tickets_csv(db, start_date, end_date, filters)
        return Response(
            content=data,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=tickets_{start_date}_{end_date}.csv"},
        )
