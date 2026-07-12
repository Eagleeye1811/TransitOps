import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlmodel import SQLModel

from app.core.config import settings
from app.core.exceptions import DomainError
from app.db import base  # noqa: F401  (registers all models on SQLModel.metadata)
from app.db.session import engine
from jobs.scheduler import start_scheduler, stop_scheduler
from app.routers import activity as activity_router
from app.routers import analytics as analytics_router
from app.routers import auth as auth_router
from app.routers import documents as documents_router
from app.routers import drivers as drivers_router
from app.routers import expenses as expenses_router
from app.routers import fuel_logs as fuel_logs_router
from app.routers import maintenance as maintenance_router
from app.routers import notifications as notifications_router
from app.routers import safety as safety_router
from app.routers import settings as settings_router
from app.routers import trips as trips_router
from app.routers import users as users_router
from app.routers import vehicles as vehicles_router


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.is_sqlite:
        # Local dev convenience only — Neon/Postgres is managed by Alembic
        # migrations (see alembic/), never by create_all.
        SQLModel.metadata.create_all(engine)
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,  # Bearer tokens, not cookies — no credentials needed
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(DomainError)
def handle_domain_error(request: Request, exc: DomainError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.errors[0], "errors": exc.errors})


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth_router.router)
app.include_router(vehicles_router.router)
app.include_router(drivers_router.router)
app.include_router(trips_router.router)
app.include_router(maintenance_router.router)
app.include_router(fuel_logs_router.router)
app.include_router(expenses_router.router)
app.include_router(users_router.router)
app.include_router(settings_router.router)
app.include_router(safety_router.router)
app.include_router(notifications_router.router)
app.include_router(activity_router.router)
app.include_router(documents_router.router)
app.include_router(analytics_router.router)
