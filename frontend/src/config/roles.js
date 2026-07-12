// Internal role identifiers — used everywhere in logic/state.
// Never use display labels for comparisons.
export const ROLES = {
  ADMIN: 'admin',
  FLEET_MANAGER: 'fleet_manager',
  DISPATCHER: 'dispatcher',
  SAFETY_OFFICER: 'safety_officer',
  FINANCIAL_ANALYST: 'financial_analyst',
}

export const ROLE_LIST = [
  ROLES.ADMIN,
  ROLES.FLEET_MANAGER,
  ROLES.DISPATCHER,
  ROLES.SAFETY_OFFICER,
  ROLES.FINANCIAL_ANALYST,
]

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.FLEET_MANAGER]: 'Fleet Manager',
  [ROLES.DISPATCHER]: 'Dispatcher',
  [ROLES.SAFETY_OFFICER]: 'Safety Officer',
  [ROLES.FINANCIAL_ANALYST]: 'Financial Analyst',
}

export const ROLE_SHORT_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.FLEET_MANAGER]: 'Fleet Mgr',
  [ROLES.DISPATCHER]: 'Dispatcher',
  [ROLES.SAFETY_OFFICER]: 'Safety Officer',
  [ROLES.FINANCIAL_ANALYST]: 'Fin. Analyst',
}

// Shown on the login page under "Access is scoped by role after login"
export const ROLE_ACCESS_SUMMARY = {
  [ROLES.ADMIN]: 'All modules, Users, Settings and RBAC',
  [ROLES.FLEET_MANAGER]: 'Fleet, Drivers, Maintenance and Analytics',
  [ROLES.DISPATCHER]: 'Dashboard, Fleet View, Driver Availability and Trips',
  [ROLES.SAFETY_OFFICER]: 'Drivers, Compliance and Trip View',
  [ROLES.FINANCIAL_ANALYST]: 'Fleet View, Fuel & Expenses and Analytics',
}

export const ROLE_DASHBOARD_NAME = {
  [ROLES.ADMIN]: 'Admin Dashboard',
  [ROLES.FLEET_MANAGER]: 'Fleet Dashboard',
  [ROLES.DISPATCHER]: 'Operations Dashboard',
  [ROLES.SAFETY_OFFICER]: 'Safety Dashboard',
  [ROLES.FINANCIAL_ANALYST]: 'Financial Dashboard',
}

export const ROLE_BADGE_COLORS = {
  [ROLES.ADMIN]: 'bg-violet-100 text-violet-700 ring-violet-600/20',
  [ROLES.FLEET_MANAGER]: 'bg-blue-100 text-blue-700 ring-blue-600/20',
  [ROLES.DISPATCHER]: 'bg-teal-100 text-teal-700 ring-teal-600/20',
  [ROLES.SAFETY_OFFICER]: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  [ROLES.FINANCIAL_ANALYST]: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
}

export function isValidRole(role) {
  return ROLE_LIST.includes(role)
}
