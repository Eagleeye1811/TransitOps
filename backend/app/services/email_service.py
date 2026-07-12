import logging

from app.core.config import settings

logger = logging.getLogger("transitops.email")


def send_email(*, to: str, subject: str, html: str) -> bool:
    """Sends via Resend if RESEND_API_KEY is configured; otherwise logs the
    would-be email so the reminder job is fully demoable without a real
    account. Returns True if a real send was attempted (not necessarily
    delivered — Resend errors are logged, not raised, so one bad address
    doesn't take down the whole reminder sweep).
    """
    if not settings.RESEND_API_KEY:
        logger.info("[DEV MODE — no RESEND_API_KEY set] Would send email to %s: %s\n%s", to, subject, html)
        return False

    try:
        import resend

        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send(
            {
                "from": settings.REMINDER_EMAIL_FROM,
                "to": [to],
                "subject": subject,
                "html": html,
            }
        )
        return True
    except Exception:
        logger.exception("Failed to send email to %s via Resend", to)
        return False
