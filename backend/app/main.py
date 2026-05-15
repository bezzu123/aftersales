import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base
from app.routers import auth, tickets, gr, dc, vendors, users, dashboard, reports

Base.metadata.create_all(bind=engine)

# Auto-seed on first start (no-op if already seeded)
try:
    from app.seed import seed
    seed()
except Exception:
    pass

app = FastAPI(title="Aftersales Repair & Alteration Service API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(tickets.router, prefix=api_prefix)
app.include_router(gr.router, prefix=api_prefix)
app.include_router(dc.router, prefix=api_prefix)
app.include_router(vendors.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)

upload_dir = settings.upload_dir
if settings.storage_type == "local":
    os.makedirs(upload_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok"}
