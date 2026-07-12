from fastapi import APIRouter, Depends

from app import deps
from app.core.permissions import Modules
from app.schemas.org_settings import OrgSettingsRead, OrgSettingsUpdate
from app.services import settings_service
from app.services.reminder_service import check_and_send_expiry_reminders

router = APIRouter(prefix="/settings", tags=["settings"], dependencies=[Depends(deps.require_module(Modules.SETTINGS))])


@router.get("/org", response_model=OrgSettingsRead)
def get_org_settings(session: deps.SessionDep):
    return settings_service.get_org_settings(session)


@router.patch("/org", response_model=OrgSettingsRead)
def update_org_settings(payload: OrgSettingsUpdate, session: deps.SessionDep):
    return settings_service.update_org_settings(session, payload.model_dump(exclude_unset=True))


@router.post("/run-reminder-sweep")
def run_reminder_sweep(session: deps.SessionDep):
    """Manually triggers the licence/document expiry reminder sweep that
    otherwise only runs on the scheduler's daily 08:00 IST cron — lets an
    admin (or a demo) see the feature work immediately instead of waiting
    for the next scheduled run. Without a RESEND_API_KEY configured, "sent"
    emails are logged instead of delivered — see app/services/email_service.py.
    """
    return check_and_send_expiry_reminders(session)
