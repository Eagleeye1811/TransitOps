"""Python port of frontend/src/config/roles.js — keep these two files in sync."""


class Roles:
    ADMIN = "admin"
    FLEET_MANAGER = "fleet_manager"
    DISPATCHER = "dispatcher"
    SAFETY_OFFICER = "safety_officer"
    FINANCIAL_ANALYST = "financial_analyst"


ROLE_LIST = [
    Roles.ADMIN,
    Roles.FLEET_MANAGER,
    Roles.DISPATCHER,
    Roles.SAFETY_OFFICER,
    Roles.FINANCIAL_ANALYST,
]

ROLE_LABELS = {
    Roles.ADMIN: "Admin",
    Roles.FLEET_MANAGER: "Fleet Manager",
    Roles.DISPATCHER: "Dispatcher",
    Roles.SAFETY_OFFICER: "Safety Officer",
    Roles.FINANCIAL_ANALYST: "Financial Analyst",
}


def is_valid_role(role: str | None) -> bool:
    return role in ROLE_LIST
