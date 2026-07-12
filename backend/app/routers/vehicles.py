from fastapi import APIRouter, Depends, Query

from app import deps
from app.core.exceptions import DomainError
from app.core.permissions import Actions, Modules
from app.schemas.vehicle import VehicleCreate, VehicleRead, VehicleUpdate
from app.services import fleet_service

router = APIRouter(prefix="/vehicles", tags=["fleet"])


@router.get("", response_model=list[VehicleRead], dependencies=[Depends(deps.require_module(Modules.FLEET))])
def list_vehicles(
    session: deps.SessionDep,
    status: str | None = None,
    type: str | None = None,
    region: str | None = None,
    search: str | None = None,
):
    return fleet_service.list_vehicles(session, status=status, type=type, region=region, search=search)


@router.get("/check-registration", dependencies=[Depends(deps.require_module(Modules.FLEET))])
def check_registration(session: deps.SessionDep, registration: str = Query(...), exclude_id: str | None = None):
    return {"taken": fleet_service.is_registration_taken(session, registration, exclude_id)}


@router.get("/{vehicle_id}", response_model=VehicleRead, dependencies=[Depends(deps.require_module(Modules.FLEET))])
def get_vehicle(vehicle_id: str, session: deps.SessionDep):
    return fleet_service.get_vehicle(session, vehicle_id)


@router.post("", response_model=VehicleRead, dependencies=[Depends(deps.require_action(Modules.FLEET, Actions.CREATE))])
def create_vehicle(payload: VehicleCreate, session: deps.SessionDep):
    if fleet_service.is_registration_taken(session, payload.registration):
        raise DomainError(f"Registration {payload.registration} is already in use.")
    return fleet_service.create_vehicle(session, payload.model_dump())


@router.patch(
    "/{vehicle_id}", response_model=VehicleRead, dependencies=[Depends(deps.require_action(Modules.FLEET, Actions.EDIT))]
)
def update_vehicle(vehicle_id: str, payload: VehicleUpdate, session: deps.SessionDep):
    data = payload.model_dump(exclude_unset=True)
    if "registration" in data and fleet_service.is_registration_taken(session, data["registration"], vehicle_id):
        raise DomainError(f"Registration {data['registration']} is already in use.")
    return fleet_service.update_vehicle(session, vehicle_id, data)


@router.post(
    "/{vehicle_id}/retire",
    response_model=VehicleRead,
    dependencies=[Depends(deps.require_action(Modules.FLEET, Actions.RETIRE))],
)
def retire_vehicle(vehicle_id: str, session: deps.SessionDep):
    return fleet_service.retire_vehicle(session, vehicle_id)
