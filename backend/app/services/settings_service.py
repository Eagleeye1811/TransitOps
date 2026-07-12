from sqlmodel import Session

from app.models.org_settings import OrgSettings


def get_org_settings(session: Session) -> OrgSettings:
    settings_row = session.get(OrgSettings, 1)
    if settings_row is None:
        # Singleton bootstrap concern, not a real 404 — create the default
        # row on the fly rather than raising.
        settings_row = OrgSettings(id=1)
        session.add(settings_row)
        session.commit()
        session.refresh(settings_row)
    return settings_row


def update_org_settings(session: Session, payload: dict) -> OrgSettings:
    settings_row = get_org_settings(session)
    for key, value in payload.items():
        if value is not None:
            setattr(settings_row, key, value)
    session.add(settings_row)
    session.commit()
    session.refresh(settings_row)
    return settings_row
