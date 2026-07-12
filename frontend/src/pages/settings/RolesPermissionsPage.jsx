import { KeySquare } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
import { AccessBadge } from '@/components/common/Badge'
import { RolesPermissionsTable, ACCESS_LEVEL_DESCRIPTIONS } from '@/components/settings/RolesPermissionsTable'
import { ACCESS_LEVELS, ACCESS_LEVEL_LABELS, ACCESS_LEVEL_BADGE_CLASSES } from '@/config/permissions'

const LEGEND_ORDER = [
  ACCESS_LEVELS.FULL,
  ACCESS_LEVELS.VIEW,
  ACCESS_LEVELS.OPERATIONAL_VIEW,
  ACCESS_LEVELS.AVAILABILITY_VIEW,
  ACCESS_LEVELS.FINANCIAL_VIEW,
  ACCESS_LEVELS.COST_VIEW,
  ACCESS_LEVELS.FLEET_ANALYTICS,
  ACCESS_LEVELS.SAFETY_REPORTS,
  ACCESS_LEVELS.FINANCIAL_ANALYTICS,
  ACCESS_LEVELS.NO_ACCESS,
]

export default function RolesPermissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <KeySquare className="size-4.5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Roles &amp; Permissions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Reference matrix of module access per role.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Role-Based Access Control</CardTitle>
            <CardDescription>
              This is the authoritative permission matrix defined centrally in the app&rsquo;s configuration
              (<code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">src/config/permissions.js</code>).
              It is shown here for reference only — access levels cannot be edited from this screen.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <RolesPermissionsTable />

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Access level legend</p>
            <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {LEGEND_ORDER.map((level) => (
                <div key={level} className="flex items-start gap-2.5">
                  <AccessBadge
                    accessLevel={level}
                    label={ACCESS_LEVEL_LABELS[level]}
                    className={`${ACCESS_LEVEL_BADGE_CLASSES[level]} mt-0.5 shrink-0`}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">{ACCESS_LEVEL_DESCRIPTIONS[level]}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
