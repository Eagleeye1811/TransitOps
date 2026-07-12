import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/config/roles'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { FleetManagerDashboard } from '@/components/dashboard/FleetManagerDashboard'
import { DispatcherDashboard } from '@/components/dashboard/DispatcherDashboard'
import { SafetyOfficerDashboard } from '@/components/dashboard/SafetyOfficerDashboard'
import { FinancialAnalystDashboard } from '@/components/dashboard/FinancialAnalystDashboard'

const DASHBOARDS = {
  [ROLES.ADMIN]: AdminDashboard,
  [ROLES.FLEET_MANAGER]: FleetManagerDashboard,
  [ROLES.DISPATCHER]: DispatcherDashboard,
  [ROLES.SAFETY_OFFICER]: SafetyOfficerDashboard,
  [ROLES.FINANCIAL_ANALYST]: FinancialAnalystDashboard,
}

export default function DashboardPage() {
  const { role, user } = useAuth()
  const DashboardComponent = DASHBOARDS[role]

  return (
    <div className="space-y-1">
      <div className="mb-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
      </div>
      {DashboardComponent ? <DashboardComponent /> : null}
    </div>
  )
}
