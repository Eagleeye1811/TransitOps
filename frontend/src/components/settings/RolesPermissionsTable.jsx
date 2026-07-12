import { LayoutDashboard } from 'lucide-react'
import { TableContainer, THead, TBody, TR, TH, TD } from '@/components/common/Table'
import { AccessBadge } from '@/components/common/Badge'
import { Tooltip } from '@/components/common/Tooltip'
import { RoleBadge } from '@/components/layout/RoleBadge'
import { ROLE_LIST, ROLE_DASHBOARD_NAME } from '@/config/roles'
import { MODULES, PERMISSION_MATRIX, ACCESS_LEVELS, getAccessLabel, getAccessBadgeClasses } from '@/config/permissions'

const COLUMNS = [
  { key: MODULES.DASHBOARD, label: 'Dashboard' },
  { key: MODULES.FLEET, label: 'Fleet' },
  { key: MODULES.DRIVERS, label: 'Drivers' },
  { key: MODULES.TRIPS, label: 'Trips' },
  { key: MODULES.MAINTENANCE, label: 'Maintenance' },
  { key: MODULES.EXPENSES, label: 'Fuel & Expenses' },
  { key: MODULES.ANALYTICS, label: 'Analytics' },
  { key: MODULES.SETTINGS, label: 'Settings' },
]

// Plain-English explanations shown on hover over each access-level badge.
// eslint-disable-next-line react-refresh/only-export-components
export const ACCESS_LEVEL_DESCRIPTIONS = {
  [ACCESS_LEVELS.FULL]: 'Full access — can view, create, edit and delete records in this module.',
  [ACCESS_LEVELS.VIEW]: 'Read-only access — can view records but cannot create or edit them.',
  [ACCESS_LEVELS.OPERATIONAL_VIEW]:
    'Can view records and update day-to-day operational fields, but does not have full edit rights.',
  [ACCESS_LEVELS.AVAILABILITY_VIEW]: 'Can view availability status only, without access to full record details.',
  [ACCESS_LEVELS.FINANCIAL_VIEW]: 'Can view financial details related to this module only.',
  [ACCESS_LEVELS.COST_VIEW]: 'Can view costs but cannot create or edit records.',
  [ACCESS_LEVELS.FLEET_ANALYTICS]: 'Access to fleet-focused analytics and reports only.',
  [ACCESS_LEVELS.SAFETY_REPORTS]: 'Access to safety and compliance analytics and reports only.',
  [ACCESS_LEVELS.FINANCIAL_ANALYTICS]: 'Access to financial analytics and reports only.',
  [ACCESS_LEVELS.NO_ACCESS]: 'No access — this module is hidden for this role.',
}

/**
 * Read-only reference table rendering the full role x module RBAC matrix
 * sourced from `PERMISSION_MATRIX` in src/config/permissions.js. There is
 * no editing UI here — permissions are hardcoded centrally as the single
 * source of truth for the app.
 */
export function RolesPermissionsTable() {
  return (
    <TableContainer>
      <THead>
        <TR>
          <TH>Role</TH>
          {COLUMNS.map((col) => (
            <TH key={col.key}>{col.label}</TH>
          ))}
        </TR>
      </THead>
      <TBody>
        {ROLE_LIST.map((role) => (
          <TR key={role}>
            <TD>
              <RoleBadge role={role} />
            </TD>
            {COLUMNS.map((col) => {
              if (col.key === MODULES.DASHBOARD) {
                const dashboardName = ROLE_DASHBOARD_NAME[role]
                return (
                  <TD key={col.key}>
                    <Tooltip content={`Every role has full access to their own scoped dashboard: ${dashboardName}.`}>
                      <span className="inline-flex cursor-default items-center gap-1.5 whitespace-nowrap rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30">
                        <LayoutDashboard className="size-3.5" />
                        {dashboardName}
                      </span>
                    </Tooltip>
                  </TD>
                )
              }

              const level = PERMISSION_MATRIX[role]?.[col.key] ?? ACCESS_LEVELS.NO_ACCESS
              return (
                <TD key={col.key}>
                  <Tooltip content={ACCESS_LEVEL_DESCRIPTIONS[level]}>
                    <AccessBadge
                      accessLevel={level}
                      label={getAccessLabel(level)}
                      className={getAccessBadgeClasses(level)}
                    />
                  </Tooltip>
                </TD>
              )
            })}
          </TR>
        ))}
      </TBody>
    </TableContainer>
  )
}
