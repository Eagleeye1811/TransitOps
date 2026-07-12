// ============================================================================
// CENTRAL RBAC CONFIGURATION
// This is the single source of truth for module access and action-level
// permissions across the whole app. No component should hardcode
// `role === 'admin'`-style checks — always go through the helpers below.
// ============================================================================
import { ROLES, isValidRole } from './roles'

export const MODULES = {
  DASHBOARD: 'dashboard',
  FLEET: 'fleet',
  DRIVERS: 'drivers',
  TRIPS: 'trips',
  MAINTENANCE: 'maintenance',
  EXPENSES: 'expenses',
  ANALYTICS: 'analytics',
  COMPLIANCE: 'compliance',
  SETTINGS: 'settings',
  USERS: 'users',
  RBAC: 'rbac',
}

export const ACCESS_LEVELS = {
  FULL: 'full',
  VIEW: 'view',
  OPERATIONAL_VIEW: 'operational_view',
  AVAILABILITY_VIEW: 'availability_view',
  FINANCIAL_VIEW: 'financial_view',
  COST_VIEW: 'cost_view',
  FLEET_ANALYTICS: 'fleet_analytics',
  SAFETY_REPORTS: 'safety_reports',
  FINANCIAL_ANALYTICS: 'financial_analytics',
  NO_ACCESS: 'no_access',
}

export const ACCESS_LEVEL_LABELS = {
  [ACCESS_LEVELS.FULL]: 'Full',
  [ACCESS_LEVELS.VIEW]: 'View',
  [ACCESS_LEVELS.OPERATIONAL_VIEW]: 'Operational View',
  [ACCESS_LEVELS.AVAILABILITY_VIEW]: 'Availability View',
  [ACCESS_LEVELS.FINANCIAL_VIEW]: 'Financial View',
  [ACCESS_LEVELS.COST_VIEW]: 'Cost View',
  [ACCESS_LEVELS.FLEET_ANALYTICS]: 'Fleet Analytics',
  [ACCESS_LEVELS.SAFETY_REPORTS]: 'Safety Reports',
  [ACCESS_LEVELS.FINANCIAL_ANALYTICS]: 'Financial Analytics',
  [ACCESS_LEVELS.NO_ACCESS]: 'No Access',
}

export const ACCESS_LEVEL_BADGE_CLASSES = {
  [ACCESS_LEVELS.FULL]: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  [ACCESS_LEVELS.VIEW]: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  [ACCESS_LEVELS.OPERATIONAL_VIEW]: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  [ACCESS_LEVELS.AVAILABILITY_VIEW]: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  [ACCESS_LEVELS.FINANCIAL_VIEW]: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  [ACCESS_LEVELS.COST_VIEW]: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  [ACCESS_LEVELS.FLEET_ANALYTICS]: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  [ACCESS_LEVELS.SAFETY_REPORTS]: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  [ACCESS_LEVELS.FINANCIAL_ANALYTICS]: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  [ACCESS_LEVELS.NO_ACCESS]: 'bg-gray-100 text-gray-500 ring-gray-400/20',
}

// ----------------------------------------------------------------------------
// Module access matrix — the authoritative source of truth.
// role -> module -> access level
// ----------------------------------------------------------------------------
const A = ACCESS_LEVELS

export const PERMISSION_MATRIX = {
  [ROLES.ADMIN]: {
    [MODULES.DASHBOARD]: A.FULL,
    [MODULES.FLEET]: A.FULL,
    [MODULES.DRIVERS]: A.FULL,
    [MODULES.TRIPS]: A.FULL,
    [MODULES.MAINTENANCE]: A.FULL,
    [MODULES.EXPENSES]: A.FULL,
    [MODULES.ANALYTICS]: A.FULL,
    [MODULES.COMPLIANCE]: A.FULL,
    [MODULES.SETTINGS]: A.FULL,
    [MODULES.USERS]: A.FULL,
    [MODULES.RBAC]: A.FULL,
  },
  [ROLES.FLEET_MANAGER]: {
    [MODULES.DASHBOARD]: A.FULL,
    [MODULES.FLEET]: A.FULL,
    [MODULES.DRIVERS]: A.OPERATIONAL_VIEW,
    [MODULES.TRIPS]: A.NO_ACCESS,
    [MODULES.MAINTENANCE]: A.FULL,
    [MODULES.EXPENSES]: A.NO_ACCESS,
    [MODULES.ANALYTICS]: A.FLEET_ANALYTICS,
    [MODULES.COMPLIANCE]: A.NO_ACCESS,
    [MODULES.SETTINGS]: A.NO_ACCESS,
    [MODULES.USERS]: A.NO_ACCESS,
    [MODULES.RBAC]: A.NO_ACCESS,
  },
  [ROLES.DISPATCHER]: {
    [MODULES.DASHBOARD]: A.FULL,
    [MODULES.FLEET]: A.VIEW,
    [MODULES.DRIVERS]: A.AVAILABILITY_VIEW,
    [MODULES.TRIPS]: A.FULL,
    [MODULES.MAINTENANCE]: A.VIEW,
    [MODULES.EXPENSES]: A.NO_ACCESS,
    [MODULES.ANALYTICS]: A.NO_ACCESS,
    [MODULES.COMPLIANCE]: A.NO_ACCESS,
    [MODULES.SETTINGS]: A.NO_ACCESS,
    [MODULES.USERS]: A.NO_ACCESS,
    [MODULES.RBAC]: A.NO_ACCESS,
  },
  [ROLES.SAFETY_OFFICER]: {
    [MODULES.DASHBOARD]: A.FULL,
    [MODULES.FLEET]: A.NO_ACCESS,
    [MODULES.DRIVERS]: A.FULL,
    [MODULES.TRIPS]: A.VIEW,
    [MODULES.MAINTENANCE]: A.NO_ACCESS,
    [MODULES.EXPENSES]: A.NO_ACCESS,
    [MODULES.ANALYTICS]: A.SAFETY_REPORTS,
    [MODULES.COMPLIANCE]: A.FULL,
    [MODULES.SETTINGS]: A.NO_ACCESS,
    [MODULES.USERS]: A.NO_ACCESS,
    [MODULES.RBAC]: A.NO_ACCESS,
  },
  [ROLES.FINANCIAL_ANALYST]: {
    [MODULES.DASHBOARD]: A.FULL,
    [MODULES.FLEET]: A.FINANCIAL_VIEW,
    [MODULES.DRIVERS]: A.NO_ACCESS,
    [MODULES.TRIPS]: A.NO_ACCESS,
    [MODULES.MAINTENANCE]: A.COST_VIEW,
    [MODULES.EXPENSES]: A.FULL,
    [MODULES.ANALYTICS]: A.FINANCIAL_ANALYTICS,
    [MODULES.COMPLIANCE]: A.NO_ACCESS,
    [MODULES.SETTINGS]: A.NO_ACCESS,
    [MODULES.USERS]: A.NO_ACCESS,
    [MODULES.RBAC]: A.NO_ACCESS,
  },
}

// ----------------------------------------------------------------------------
// Action-level permissions.
// role -> module -> [actions]
// ----------------------------------------------------------------------------
export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  EDIT_OPERATIONAL: 'edit_operational',
  DELETE: 'delete',
  RETIRE: 'retire',
  DISPATCH: 'dispatch',
  CANCEL: 'cancel',
  COMPLETE: 'complete',
  SUSPEND: 'suspend',
  REACTIVATE: 'reactivate',
  MARK_AVAILABLE: 'mark_available',
  MARK_OFF_DUTY: 'mark_off_duty',
  UPDATE_STATUS: 'update_status',
  UPDATE_LICENCE: 'update_licence',
  UPDATE_SAFETY_SCORE: 'update_safety_score',
  RECORD_INCIDENT: 'record_incident',
  UPDATE_VIOLATION: 'update_violation',
  EXPORT: 'export',
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_SETTINGS: 'manage_settings',
  RESET_ACCOUNT: 'reset_account',
}

const PERMISSION_ACTIONS = {
  [ROLES.FLEET_MANAGER]: {
    [MODULES.FLEET]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.UPDATE_STATUS, ACTIONS.RETIRE],
    [MODULES.DRIVERS]: [ACTIONS.VIEW, ACTIONS.EDIT_OPERATIONAL],
    [MODULES.MAINTENANCE]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.UPDATE_STATUS, ACTIONS.COMPLETE, ACTIONS.CANCEL],
    [MODULES.ANALYTICS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
  },
  [ROLES.DISPATCHER]: {
    [MODULES.FLEET]: [ACTIONS.VIEW],
    [MODULES.DRIVERS]: [ACTIONS.VIEW],
    [MODULES.TRIPS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DISPATCH, ACTIONS.CANCEL, ACTIONS.COMPLETE],
    [MODULES.MAINTENANCE]: [ACTIONS.VIEW],
  },
  [ROLES.SAFETY_OFFICER]: {
    [MODULES.DRIVERS]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.UPDATE_LICENCE,
      ACTIONS.UPDATE_SAFETY_SCORE,
      ACTIONS.SUSPEND,
      ACTIONS.REACTIVATE,
      ACTIONS.MARK_AVAILABLE,
      ACTIONS.MARK_OFF_DUTY,
      ACTIONS.RECORD_INCIDENT,
    ],
    [MODULES.COMPLIANCE]: [
      ACTIONS.VIEW,
      ACTIONS.RECORD_INCIDENT,
      ACTIONS.UPDATE_VIOLATION,
      ACTIONS.SUSPEND,
      ACTIONS.REACTIVATE,
      ACTIONS.UPDATE_LICENCE,
    ],
    [MODULES.TRIPS]: [ACTIONS.VIEW],
    [MODULES.ANALYTICS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
  },
  [ROLES.FINANCIAL_ANALYST]: {
    [MODULES.FLEET]: [ACTIONS.VIEW],
    [MODULES.EXPENSES]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT],
    [MODULES.MAINTENANCE]: [ACTIONS.VIEW],
    [MODULES.ANALYTICS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
  },
}

const ALL_ACTIONS = Object.values(ACTIONS)

/** Returns the access level string for a role/module pair. */
export function getModuleAccess(role, module) {
  if (!isValidRole(role)) return ACCESS_LEVELS.NO_ACCESS
  return PERMISSION_MATRIX[role]?.[module] ?? ACCESS_LEVELS.NO_ACCESS
}

/** Whether a role can access a module at all (any access level other than none). */
export function canAccessModule(role, module) {
  return getModuleAccess(role, module) !== ACCESS_LEVELS.NO_ACCESS
}

/** Whether a role can perform a specific action within a module. */
export function canPerformAction(role, module, action) {
  if (!isValidRole(role)) return false
  if (!canAccessModule(role, module)) return false
  if (role === ROLES.ADMIN) return ALL_ACTIONS.includes(action) || true
  return PERMISSION_ACTIONS[role]?.[module]?.includes(action) ?? false
}

export function getAccessLabel(accessLevel) {
  return ACCESS_LEVEL_LABELS[accessLevel] ?? ACCESS_LEVEL_LABELS[ACCESS_LEVELS.NO_ACCESS]
}

export function getAccessBadgeClasses(accessLevel) {
  return ACCESS_LEVEL_BADGE_CLASSES[accessLevel] ?? ACCESS_LEVEL_BADGE_CLASSES[ACCESS_LEVELS.NO_ACCESS]
}
