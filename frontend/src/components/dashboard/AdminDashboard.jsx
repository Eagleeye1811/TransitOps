import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, UserCheck, UserX, Truck, Wrench, Route, Wallet, Settings, KeySquare, ArrowRight } from 'lucide-react'
import { StatCard } from './StatCard'
import { RecentActivityList } from './RecentActivityList'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { CardSkeleton } from '@/components/common/Skeleton'
import { VEHICLE_STATUS } from '@/data/vehicles'
import { TRIP_STATUS } from '@/data/trips'
import { ROLE_LABELS, ROLE_LIST } from '@/config/roles'
import { formatCurrency, formatNumber } from '@/utils/formatters'
import * as userService from '@/services/userService'
import * as fleetService from '@/services/fleetService'
import * as driverService from '@/services/driverService'
import * as tripService from '@/services/tripService'
import * as expenseService from '@/services/expenseService'
import * as activityService from '@/services/activityService'

export function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([
      userService.getUsers(),
      fleetService.getVehicles(),
      driverService.getDrivers(),
      tripService.getTrips(),
      expenseService.getFuelLogs(),
      expenseService.getExpenses(),
      activityService.getActivity(),
    ])
      .then(([users, vehicles, drivers, trips, fuelLogs, expenses, activity]) => {
        if (!active) return
        setData({ users, vehicles, drivers, trips, fuelLogs, expenses, activity })
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} className="h-40" />
        ))}
      </div>
    )
  }

  const { users, vehicles, drivers, trips, fuelLogs, expenses, activity } = data

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === 'active').length
  const inactiveUsers = totalUsers - activeUsers
  const usersByRole = ROLE_LIST.map((role) => ({
    role,
    count: users.filter((u) => u.role === role).length,
  }))

  const totalVehicles = vehicles.length
  const totalDrivers = drivers.length
  const activeTrips = trips.filter((t) => t.status === TRIP_STATUS.DISPATCHED).length
  const inMaintenance = vehicles.filter((v) => v.status === VEHICLE_STATUS.IN_SHOP).length
  const totalExpense =
    fuelLogs.reduce((sum, f) => sum + f.cost, 0) + expenses.reduce((sum, e) => sum + e.amount, 0)

  const recentActivity = activity.map((a) => ({
    id: a.id,
    actor: a.actorName,
    role: ROLE_LABELS[a.actorRole] ?? a.actorRole,
    action: a.action,
    timestamp: a.timestamp,
  }))

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
                <span className="text-slate-600 dark:text-slate-400">{ROLE_LABELS[role]}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(count / totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="w-4 text-right font-medium text-slate-800 dark:text-slate-200">{count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <RecentActivityList items={recentActivity} />
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
      className="group flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-700 dark:hover:border-brand-700 dark:hover:bg-brand-500/10"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <ArrowRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500 dark:text-slate-600" />
    </Link>
  )
}
