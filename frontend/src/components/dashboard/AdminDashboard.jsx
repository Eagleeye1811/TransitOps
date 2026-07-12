import { Link } from 'react-router-dom'
import { Users, UserCheck, UserX, Truck, Wrench, Route, Wallet, Settings, KeySquare, ArrowRight } from 'lucide-react'
import { StatCard } from './StatCard'
import { RecentActivityList } from './RecentActivityList'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { USERS } from '@/data/users'
import { VEHICLES, VEHICLE_STATUS } from '@/data/vehicles'
import { DRIVERS } from '@/data/drivers'
import { TRIPS, TRIP_STATUS } from '@/data/trips'
import { FUEL_LOGS, EXPENSES } from '@/data/fuelLogs'
import { RECENT_ACTIVITY } from '@/data/activity'
import { ROLE_LABELS, ROLE_LIST } from '@/config/roles'
import { formatCurrency, formatNumber } from '@/utils/formatters'

export function AdminDashboard() {
  const totalUsers = USERS.length
  const activeUsers = USERS.filter((u) => u.status === 'active').length
  const inactiveUsers = totalUsers - activeUsers
  const usersByRole = ROLE_LIST.map((role) => ({
    role,
    count: USERS.filter((u) => u.role === role).length,
  }))

  const totalVehicles = VEHICLES.length
  const totalDrivers = DRIVERS.length
  const activeTrips = TRIPS.filter((t) => t.status === TRIP_STATUS.DISPATCHED).length
  const inMaintenance = VEHICLES.filter((v) => v.status === VEHICLE_STATUS.IN_SHOP).length
  const totalExpense =
    FUEL_LOGS.reduce((sum, f) => sum + f.cost, 0) + EXPENSES.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={totalUsers} accent="brand" />
        <StatCard icon={UserCheck} label="Active Users" value={activeUsers} accent="emerald" />
        <StatCard icon={UserX} label="Inactive / Locked" value={inactiveUsers} accent="slate" />
        <StatCard icon={Truck} label="Total Vehicles" value={totalVehicles} accent="blue" />
        <StatCard icon={Users} label="Total Drivers" value={totalDrivers} accent="teal" />
        <StatCard icon={Route} label="Active Trips" value={activeTrips} accent="violet" />
        <StatCard icon={Wrench} label="In Maintenance" value={inMaintenance} accent="amber" />
        <StatCard icon={Wallet} label="Total Op. Expenses" value={formatCurrency(totalExpense)} accent="red" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {usersByRole.map(({ role, count }) => (
              <div key={role} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{ROLE_LABELS[role]}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(count / totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="w-4 text-right font-medium text-slate-800">{count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <RecentActivityList items={RECENT_ACTIVITY} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administration Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QuickLink to="/settings/users" icon={Users} label="Manage Users" description={`${formatNumber(totalUsers)} accounts`} />
          <QuickLink to="/settings/roles" icon={KeySquare} label="Roles & Permissions" description="Configure RBAC matrix" />
          <QuickLink to="/settings/general" icon={Settings} label="General Settings" description="Org, region & currency" />
        </CardContent>
      </Card>
    </div>
  )
}

function QuickLink({ to, icon: Icon, label, description }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/50"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <ArrowRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
    </Link>
  )
}
