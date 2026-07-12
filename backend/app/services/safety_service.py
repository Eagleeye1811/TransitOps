from sqlmodel import Session, select

from app.core.exceptions import NotFoundError
from app.models.safety import SafetyIncident, SafetyViolation
from app.services.id_service import next_id


def list_incidents(
    session: Session,
    *,
    driver_id: str | None = None,
    severity: str | None = None,
) -> list[SafetyIncident]:
    query = select(SafetyIncident)
    if driver_id:
        query = query.where(SafetyIncident.driver_id == driver_id)
    if severity:
        query = query.where(SafetyIncident.severity == severity)
    return list(session.exec(query.order_by(SafetyIncident.id)).all())


def create_incident(session: Session, payload: dict) -> SafetyIncident:
    incident_id = next_id(session, "INC")
    incident = SafetyIncident(id=incident_id, status="under_review", **payload)
    session.add(incident)
    session.commit()
    session.refresh(incident)
    return incident


def update_incident(session: Session, incident_id: str, payload: dict) -> SafetyIncident:
    incident = session.get(SafetyIncident, incident_id, with_for_update=True)
    if incident is None:
        raise NotFoundError(f"Safety incident {incident_id} not found.")
    for key, value in payload.items():
        if value is not None:
            setattr(incident, key, value)
    session.add(incident)
    session.commit()
    session.refresh(incident)
    return incident


def list_violations(
    session: Session,
    *,
    driver_id: str | None = None,
    status: str | None = None,
) -> list[SafetyViolation]:
    query = select(SafetyViolation)
    if driver_id:
        query = query.where(SafetyViolation.driver_id == driver_id)
    if status:
        query = query.where(SafetyViolation.status == status)
    return list(session.exec(query.order_by(SafetyViolation.id)).all())


def create_violation(session: Session, payload: dict) -> SafetyViolation:
    violation_id = next_id(session, "VIO")
    violation = SafetyViolation(id=violation_id, status="open", **payload)
    session.add(violation)
    session.commit()
    session.refresh(violation)
    return violation


def update_violation(session: Session, violation_id: str, payload: dict) -> SafetyViolation:
    violation = session.get(SafetyViolation, violation_id, with_for_update=True)
    if violation is None:
        raise NotFoundError(f"Safety violation {violation_id} not found.")
    for key, value in payload.items():
        if value is not None:
            setattr(violation, key, value)
    session.add(violation)
    session.commit()
    session.refresh(violation)
    return violation
