from datetime import date

from fastapi import APIRouter, Depends

from app import deps
from app.core.permissions import Actions, Modules
from app.schemas.trip import (
    CancelTripRequest,
    TripCreate,
    TripRead,
    TripUpdate,
    ValidateAssignmentRequest,
    ValidationResult,
)
from app.services import trip_service

router = APIRouter(prefix="/trips", tags=["trips"])


@router.get("", response_model=list[TripRead], dependencies=[Depends(deps.require_module(Modules.TRIPS))])
def list_trips(
    session: deps.SessionDep,
    status: str | None = None,
    search: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
):
    return trip_service.list_trips(session, status=status, search=search, date_from=date_from, date_to=date_to)


@router.get("/{trip_id}", response_model=TripRead, dependencies=[Depends(deps.require_module(Modules.TRIPS))])
def get_trip(trip_id: str, session: deps.SessionDep):
    return trip_service.get_trip(session, trip_id)


@router.post(
    "/validate-assignment",
    response_model=ValidationResult,
    dependencies=[Depends(deps.require_module(Modules.TRIPS))],
)
def validate_assignment(payload: ValidateAssignmentRequest, session: deps.SessionDep):
    is_valid, errors = trip_service.validate_assignment(
        session,
        vehicle_id=payload.vehicle_id,
        driver_id=payload.driver_id,
        cargo_weight_kg=payload.cargo_weight_kg,
        exclude_trip_id=payload.exclude_trip_id,
    )
    return ValidationResult(is_valid=is_valid, errors=errors)


@router.post("", response_model=TripRead, dependencies=[Depends(deps.require_action(Modules.TRIPS, Actions.CREATE))])
def create_trip(payload: TripCreate, session: deps.SessionDep):
    return trip_service.create_trip(session, payload.model_dump())


@router.patch(
    "/{trip_id}", response_model=TripRead, dependencies=[Depends(deps.require_action(Modules.TRIPS, Actions.EDIT))]
)
def update_trip(trip_id: str, payload: TripUpdate, session: deps.SessionDep):
    return trip_service.update_trip(session, trip_id, payload.model_dump(exclude_unset=True))


@router.post(
    "/{trip_id}/dispatch",
    response_model=TripRead,
    dependencies=[Depends(deps.require_action(Modules.TRIPS, Actions.DISPATCH))],
)
def dispatch_trip(trip_id: str, session: deps.SessionDep):
    return trip_service.dispatch_trip(session, trip_id)


@router.post(
    "/{trip_id}/cancel",
    response_model=TripRead,
    dependencies=[Depends(deps.require_action(Modules.TRIPS, Actions.CANCEL))],
)
def cancel_trip(trip_id: str, payload: CancelTripRequest, session: deps.SessionDep):
    return trip_service.cancel_trip(session, trip_id, payload.reason)


@router.post(
    "/{trip_id}/complete",
    response_model=TripRead,
    dependencies=[Depends(deps.require_action(Modules.TRIPS, Actions.COMPLETE))],
)
def complete_trip(trip_id: str, session: deps.SessionDep):
    return trip_service.complete_trip(session, trip_id)
