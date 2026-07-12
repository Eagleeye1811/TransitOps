import logging

from apscheduler.schedulers.background import BackgroundScheduler
from sqlmodel import Session, text

from app.core.config import settings
from app.db.session import engine
from app.services.reminder_service import check_and_send_expiry_reminders

logger = logging.getLogger("transitops.scheduler")

_scheduler: BackgroundScheduler | None = None


def _run_reminder_sweep() -> None:
    with Session(engine) as session:
        report = check_and_send_expiry_reminders(session)
        logger.info("Licence/document expiry reminder sweep: %s", report)


def _keep_warm_ping() -> None:
    """Neon (and most serverless Postgres) auto-suspends the compute after
    a few idle minutes; a first query after that has real, demo-visible
    latency. A lightweight periodic SELECT 1 keeps the connection warm
    during active hours. No-op cost/benefit on SQLite — skipped there.
    """
    with Session(engine) as session:
        session.exec(text("SELECT 1"))


def start_scheduler() -> BackgroundScheduler:
    global _scheduler
    if _scheduler is not None:
        return _scheduler

    scheduler = BackgroundScheduler(timezone="Asia/Kolkata")
    scheduler.add_job(_run_reminder_sweep, "cron", hour=8, minute=0, id="licence_expiry_reminder")

    if not settings.is_sqlite:
        scheduler.add_job(_keep_warm_ping, "interval", minutes=4, id="neon_keep_warm")

    scheduler.start()
    _scheduler = scheduler
    logger.info("Scheduler started (reminder sweep daily at 08:00 IST%s).", "" if settings.is_sqlite else " + Neon keep-warm ping every 4min")
    return scheduler


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
