from fastapi import APIRouter, Depends

from app import deps
from app.core.permissions import Modules
from app.schemas.analytics import AnalyticsSummary
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get(
    "/summary",
    response_model=AnalyticsSummary,
    dependencies=[Depends(deps.require_module(Modules.ANALYTICS))],
)
def get_summary(session: deps.SessionDep):
    """Every role permitted into the analytics module (full,
    fleet_analytics, safety_reports, financial_analytics) gets the same
    full payload back — the frontend already branches which sections to
    *render* by role via `access(MODULES.ANALYTICS)`, consistent with how
    every other endpoint in this app returns full objects and leaves
    module/action gating (not field-level filtering) to do the access
    control.
    """
    return analytics_service.get_summary(session)
