from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.db import base  # noqa: F401  (registers all models)
from app.db.session import get_session
from app.main import app
from app.core.security import hash_password
from app.models.driver import Driver
from app.models.enums import DriverStatus, VehicleStatus
from app.models.user import User
from app.models.vehicle import Vehicle


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def seed_minimal(session: Session):
    """A small, fast fixture (not the full seed/seed.py dataset) covering
    just what the core-logic tests need: one user per role, two vehicles,
    two drivers.
    """
    password_hash = hash_password("Demo@123")
    users = [
        User(id="USR-001", name="Admin User", email="admin@test.in", password_hash=password_hash, role="admin"),
        User(
            id="USR-002",
            name="Dispatcher User",
            email="dispatcher@test.in",
            password_hash=password_hash,
            role="dispatcher",
        ),
    ]
    vehicles = [
        Vehicle(
            id="VEH-001", registration="GJ01AB1111", model="Test Van", type="Van", capacity_kg=500,
            region="Ahmedabad", status=VehicleStatus.AVAILABLE,
        ),
        Vehicle(
            id="VEH-002", registration="GJ01AB2222", model="Test Truck", type="Truck", capacity_kg=5000,
            region="Ahmedabad", status=VehicleStatus.RETIRED,
        ),
    ]
    drivers = [
        Driver(
            id="DRV-001", name="Test Driver One", licence_number="DL-1111", licence_category="LMV",
            licence_expiry=date(2030, 1, 1), region="Ahmedabad", status=DriverStatus.AVAILABLE,
        ),
        Driver(
            id="DRV-002", name="Test Driver Two", licence_number="DL-2222", licence_category="LMV",
            licence_expiry=date(2030, 1, 1), region="Ahmedabad", status=DriverStatus.SUSPENDED,
        ),
    ]
    for obj in [*users, *vehicles, *drivers]:
        session.add(obj)
    session.commit()
    return {"users": users, "vehicles": vehicles, "drivers": drivers}
