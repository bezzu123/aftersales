"""Run: python -m app.seed"""
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.vendor import Vendor
from app.models.branch import Branch
from app.services.auth_service import hash_password

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        if db.query(User).filter(User.username == "admin").first():
            print("Already seeded.")
            return

        branches = [
            Branch(branch_code="CEN-001", branch_name="CentralWorld", bu="CDS", region="Bangkok"),
            Branch(branch_code="CEN-002", branch_name="Central Ladprao", bu="CDS", region="Bangkok"),
            Branch(branch_code="RBS-001", branch_name="Robinson Ratchada", bu="RBS", region="Bangkok"),
        ]
        for b in branches:
            db.add(b)

        vendor = Vendor(
            vendor_code="VND-001",
            vendor_name="Prime Repair Co.",
            contact_name="Somchai Jaidee",
            contact_phone="081-234-5678",
            contact_email="service@primerepair.co.th",
            product_types="Watch,Bag,Jewelry",
        )
        db.add(vendor)
        db.flush()

        users = [
            User(
                username="admin",
                password_hash=hash_password("admin1234"),
                full_name="System Admin",
                role="admin",
            ),
            User(
                username="pc01",
                password_hash=hash_password("pc1234"),
                full_name="Nida Sombat",
                role="pc",
                branch_code="CEN-001",
            ),
            User(
                username="bdc01",
                password_hash=hash_password("bdc1234"),
                full_name="Manee BDC",
                role="bdc",
            ),
            User(
                username="gr01",
                password_hash=hash_password("gr1234"),
                full_name="Somchai GR",
                role="gr",
            ),
            User(
                username="dsm01",
                password_hash=hash_password("dsm1234"),
                full_name="Wirat Chaichana",
                role="dsm",
            ),
        ]
        for u in users:
            db.add(u)

        db.commit()
        print(
            "Seeded: 3 branches, 1 vendor, 5 users\n"
            "  admin / admin1234   (Admin)\n"
            "  pc01  / pc1234      (Product Consultant — CEN-001)\n"
            "  bdc01 / bdc1234     (BDC Staff)\n"
            "  gr01  / gr1234      (GR Staff)\n"
            "  dsm01 / dsm1234     (DSM)"
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed()
