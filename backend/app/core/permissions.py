"""Python port of frontend/src/config/permissions.js — keep these two files in sync.

This is the server-side, independently-enforced twin of the frontend's RBAC
config. Every route must go through can_access_module()/can_perform_action()
here rather than trusting whatever the UI already hid.
"""

from app.core.roles import Roles, is_valid_role


class Modules:
    DASHBOARD = "dashboard"
    FLEET = "fleet"
    DRIVERS = "drivers"
    TRIPS = "trips"
    MAINTENANCE = "maintenance"
    EXPENSES = "expenses"
    ANALYTICS = "analytics"
    COMPLIANCE = "compliance"
    SETTINGS = "settings"
    USERS = "users"
    RBAC = "rbac"


class AccessLevels:
    FULL = "full"
    VIEW = "view"
    OPERATIONAL_VIEW = "operational_view"
    AVAILABILITY_VIEW = "availability_view"
    FINANCIAL_VIEW = "financial_view"
    COST_VIEW = "cost_view"
    FLEET_ANALYTICS = "fleet_analytics"
    SAFETY_REPORTS = "safety_reports"
    FINANCIAL_ANALYTICS = "financial_analytics"
    NO_ACCESS = "no_access"


A = AccessLevels

PERMISSION_MATRIX: dict[str, dict[str, str]] = {
    Roles.ADMIN: {
        Modules.DASHBOARD: A.FULL,
        Modules.FLEET: A.FULL,
        Modules.DRIVERS: A.FULL,
        Modules.TRIPS: A.FULL,
        Modules.MAINTENANCE: A.FULL,
        Modules.EXPENSES: A.FULL,
        Modules.ANALYTICS: A.FULL,
        Modules.COMPLIANCE: A.FULL,
        Modules.SETTINGS: A.FULL,
        Modules.USERS: A.FULL,
        Modules.RBAC: A.FULL,
    },
    Roles.FLEET_MANAGER: {
        Modules.DASHBOARD: A.FULL,
        Modules.FLEET: A.FULL,
        Modules.DRIVERS: A.OPERATIONAL_VIEW,
        Modules.TRIPS: A.NO_ACCESS,
        Modules.MAINTENANCE: A.FULL,
        Modules.EXPENSES: A.NO_ACCESS,
        Modules.ANALYTICS: A.FLEET_ANALYTICS,
        Modules.COMPLIANCE: A.NO_ACCESS,
        Modules.SETTINGS: A.NO_ACCESS,
        Modules.USERS: A.NO_ACCESS,
        Modules.RBAC: A.NO_ACCESS,
    },
    Roles.DISPATCHER: {
        Modules.DASHBOARD: A.FULL,
        Modules.FLEET: A.VIEW,
        Modules.DRIVERS: A.AVAILABILITY_VIEW,
        Modules.TRIPS: A.FULL,
        Modules.MAINTENANCE: A.VIEW,
        Modules.EXPENSES: A.NO_ACCESS,
        Modules.ANALYTICS: A.NO_ACCESS,
        Modules.COMPLIANCE: A.NO_ACCESS,
        Modules.SETTINGS: A.NO_ACCESS,
        Modules.USERS: A.NO_ACCESS,
        Modules.RBAC: A.NO_ACCESS,
    },
    Roles.SAFETY_OFFICER: {
        Modules.DASHBOARD: A.FULL,
        Modules.FLEET: A.NO_ACCESS,
        Modules.DRIVERS: A.FULL,
        Modules.TRIPS: A.VIEW,
        Modules.MAINTENANCE: A.NO_ACCESS,
        Modules.EXPENSES: A.NO_ACCESS,
        Modules.ANALYTICS: A.SAFETY_REPORTS,
        Modules.COMPLIANCE: A.FULL,
        Modules.SETTINGS: A.NO_ACCESS,
        Modules.USERS: A.NO_ACCESS,
        Modules.RBAC: A.NO_ACCESS,
    },
    Roles.FINANCIAL_ANALYST: {
        Modules.DASHBOARD: A.FULL,
        Modules.FLEET: A.FINANCIAL_VIEW,
        Modules.DRIVERS: A.NO_ACCESS,
        Modules.TRIPS: A.NO_ACCESS,
        Modules.MAINTENANCE: A.COST_VIEW,
        Modules.EXPENSES: A.FULL,
        Modules.ANALYTICS: A.FINANCIAL_ANALYTICS,
        Modules.COMPLIANCE: A.NO_ACCESS,
        Modules.SETTINGS: A.NO_ACCESS,
        Modules.USERS: A.NO_ACCESS,
        Modules.RBAC: A.NO_ACCESS,
    },
}


class Actions:
    VIEW = "view"
    CREATE = "create"
    EDIT = "edit"
    EDIT_OPERATIONAL = "edit_operational"
    DELETE = "delete"
    RETIRE = "retire"
    DISPATCH = "dispatch"
    CANCEL = "cancel"
    COMPLETE = "complete"
    SUSPEND = "suspend"
    REACTIVATE = "reactivate"
    MARK_AVAILABLE = "mark_available"
    MARK_OFF_DUTY = "mark_off_duty"
    UPDATE_STATUS = "update_status"
    UPDATE_LICENCE = "update_licence"
    UPDATE_SAFETY_SCORE = "update_safety_score"
    RECORD_INCIDENT = "record_incident"
    UPDATE_VIOLATION = "update_violation"
    EXPORT = "export"
    MANAGE_USERS = "manage_users"
    MANAGE_ROLES = "manage_roles"
    MANAGE_SETTINGS = "manage_settings"
    RESET_ACCOUNT = "reset_account"


# role -> module -> [actions]. Admin is intentionally absent — it bypasses
# this matrix entirely (see can_perform_action below), mirroring the
# frontend's `if (role === ROLES.ADMIN) return true` short-circuit.
PERMISSION_ACTIONS: dict[str, dict[str, list[str]]] = {
    Roles.FLEET_MANAGER: {
        Modules.FLEET: [Actions.VIEW, Actions.CREATE, Actions.EDIT, Actions.UPDATE_STATUS, Actions.RETIRE],
        Modules.DRIVERS: [Actions.VIEW, Actions.EDIT_OPERATIONAL],
        Modules.MAINTENANCE: [
            Actions.VIEW,
            Actions.CREATE,
            Actions.EDIT,
            Actions.UPDATE_STATUS,
            Actions.COMPLETE,
            Actions.CANCEL,
        ],
        Modules.ANALYTICS: [Actions.VIEW, Actions.EXPORT],
    },
    Roles.DISPATCHER: {
        Modules.FLEET: [Actions.VIEW],
        Modules.DRIVERS: [Actions.VIEW],
        Modules.TRIPS: [
            Actions.VIEW,
            Actions.CREATE,
            Actions.EDIT,
            Actions.DISPATCH,
            Actions.CANCEL,
            Actions.COMPLETE,
        ],
        Modules.MAINTENANCE: [Actions.VIEW],
    },
    Roles.SAFETY_OFFICER: {
        Modules.DRIVERS: [
            Actions.VIEW,
            Actions.CREATE,
            Actions.EDIT,
            Actions.UPDATE_LICENCE,
            Actions.UPDATE_SAFETY_SCORE,
            Actions.SUSPEND,
            Actions.REACTIVATE,
            Actions.MARK_AVAILABLE,
            Actions.MARK_OFF_DUTY,
            Actions.RECORD_INCIDENT,
        ],
        Modules.COMPLIANCE: [
            Actions.VIEW,
            Actions.RECORD_INCIDENT,
            Actions.UPDATE_VIOLATION,
            Actions.SUSPEND,
            Actions.REACTIVATE,
            Actions.UPDATE_LICENCE,
        ],
        Modules.TRIPS: [Actions.VIEW],
        Modules.ANALYTICS: [Actions.VIEW, Actions.EXPORT],
    },
    Roles.FINANCIAL_ANALYST: {
        Modules.FLEET: [Actions.VIEW],
        Modules.EXPENSES: [Actions.VIEW, Actions.CREATE, Actions.EDIT, Actions.DELETE, Actions.EXPORT],
        Modules.MAINTENANCE: [Actions.VIEW],
        Modules.ANALYTICS: [Actions.VIEW, Actions.EXPORT],
    },
}


def get_module_access(role: str | None, module: str) -> str:
    if not is_valid_role(role):
        return AccessLevels.NO_ACCESS
    return PERMISSION_MATRIX.get(role, {}).get(module, AccessLevels.NO_ACCESS)


def can_access_module(role: str | None, module: str) -> bool:
    return get_module_access(role, module) != AccessLevels.NO_ACCESS


def can_perform_action(role: str | None, module: str, action: str) -> bool:
    if not is_valid_role(role):
        return False
    if not can_access_module(role, module):
        return False
    if role == Roles.ADMIN:
        return True
    return action in PERMISSION_ACTIONS.get(role, {}).get(module, [])
