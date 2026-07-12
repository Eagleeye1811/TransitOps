from datetime import date, timedelta

from sqlmodel import Session, select

from app.core.config import settings
from app.models.driver import Driver
from app.models.enums import UserStatus
from app.models.org_settings import OrgSettings
from app.models.user import User
from app.services.email_service import send_email

try:
    from app.models.document import Document

    _HAS_DOCUMENTS = True
except ImportError:  # pragma: no cover - documents model always ships, defensive only
    _HAS_DOCUMENTS = False


def _recipients(session: Session) -> list[User]:
    """Admin + Safety Officer are the roles responsible for compliance —
    matches who sees licence-expiry alerts in the Compliance page today.
    """
    return list(
        session.exec(
            select(User).where(User.status == UserStatus.ACTIVE, User.role.in_(("admin", "safety_officer")))
        ).all()
    )


def check_and_send_expiry_reminders(session: Session) -> dict:
    """Core reminder sweep — finds driver licences (and, if the documents
    feature has landed, uploaded documents) expiring within
    settings.LICENCE_EXPIRY_REMINDER_DAYS days, and emails every
    admin/safety_officer one consolidated summary. Returns a small report
    dict so callers (the scheduled job, or the manual-trigger endpoint) can
    show what happened without needing to inspect logs.
    """
    org_settings = session.get(OrgSettings, 1)
    if org_settings is not None and not org_settings.notify_licence_expiry:
        return {"sent": False, "reason": "Licence expiry notifications are disabled in Settings.", "items": []}

    today = date.today()
    horizon = today + timedelta(days=settings.LICENCE_EXPIRY_REMINDER_DAYS)

    expiring_drivers = list(
        session.exec(select(Driver).where(Driver.licence_expiry <= horizon).order_by(Driver.licence_expiry)).all()
    )

    expiring_documents = []
    if _HAS_DOCUMENTS:
        expiring_documents = list(
            session.exec(
                select(Document)
                .where(Document.expiry_date.is_not(None), Document.expiry_date <= horizon)
                .order_by(Document.expiry_date)
            ).all()
        )

    if not expiring_drivers and not expiring_documents:
        return {"sent": False, "reason": "Nothing expiring within the reminder window.", "items": []}

    rows = []
    for d in expiring_drivers:
        status_word = "EXPIRED" if d.licence_expiry < today else "expiring"
        rows.append(
            f"<tr><td>{d.name}</td><td>Driving Licence ({d.licence_number})</td>"
            f"<td>{d.licence_expiry.isoformat()}</td><td>{status_word}</td></tr>"
        )
    for doc in expiring_documents:
        status_word = "EXPIRED" if doc.expiry_date < today else "expiring"
        rows.append(
            f"<tr><td>{doc.owner_type.title()} {doc.owner_id}</td><td>{doc.doc_type}</td>"
            f"<td>{doc.expiry_date.isoformat()}</td><td>{status_word}</td></tr>"
        )

    html = f"""
    <h2>TransitOps — Upcoming Expiry Reminders</h2>
    <p>The following items are expiring within {settings.LICENCE_EXPIRY_REMINDER_DAYS} days (or already expired):</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <tr><th>Who / What</th><th>Item</th><th>Expiry Date</th><th>Status</th></tr>
      {''.join(rows)}
    </table>
    <p>— TransitOps automated compliance reminder</p>
    """

    recipients = _recipients(session)
    sent_to = []
    for user in recipients:
        send_email(to=user.email, subject="TransitOps: Upcoming licence/document expiries", html=html)
        sent_to.append(user.email)

    return {
        "sent": True,
        "recipients": sent_to,
        "expiring_driver_count": len(expiring_drivers),
        "expiring_document_count": len(expiring_documents),
        "items": [d.name for d in expiring_drivers] + [f"{doc.owner_type}:{doc.owner_id}" for doc in expiring_documents],
    }
