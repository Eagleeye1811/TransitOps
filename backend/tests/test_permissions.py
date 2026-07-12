from app.core.permissions import Actions, Modules, can_access_module, can_perform_action, get_module_access
from app.core.roles import Roles


def test_admin_bypasses_everything():
    assert can_perform_action(Roles.ADMIN, Modules.SETTINGS, Actions.MANAGE_SETTINGS)
    assert can_perform_action(Roles.ADMIN, Modules.TRIPS, Actions.DISPATCH)


def test_dispatcher_cannot_access_expenses():
    assert not can_access_module(Roles.DISPATCHER, Modules.EXPENSES)
    assert get_module_access(Roles.DISPATCHER, Modules.EXPENSES) == "no_access"


def test_fleet_manager_view_only_drivers():
    assert can_access_module(Roles.FLEET_MANAGER, Modules.DRIVERS)
    assert not can_perform_action(Roles.FLEET_MANAGER, Modules.DRIVERS, Actions.SUSPEND)
    assert can_perform_action(Roles.FLEET_MANAGER, Modules.DRIVERS, Actions.EDIT_OPERATIONAL)
    assert not can_perform_action(Roles.FLEET_MANAGER, Modules.DRIVERS, Actions.EDIT)


def test_safety_officer_full_driver_access():
    assert can_perform_action(Roles.SAFETY_OFFICER, Modules.DRIVERS, Actions.SUSPEND)
    assert can_perform_action(Roles.SAFETY_OFFICER, Modules.DRIVERS, Actions.EDIT)


def test_unknown_role_never_defaults_to_access():
    assert not can_access_module("some_made_up_role", Modules.DASHBOARD)
    assert not can_access_module(None, Modules.DASHBOARD)
