import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'
import { Truck, CheckCircle2, Route, Wrench, Archive, Gauge } from 'lucide-react'
import { StatCard } from './StatCard'
import { RecentActivityList } from './RecentActivityList'
import { ChartCard, EmptyChartCard } from '@/components/analytics/ChartCard'
import { CardSkeleton } from '@/components/common/Skeleton'
import { VEHICLE_STATUS } from '@/data/vehicles'
import { ROLE_LABELS } from '@/config/roles'
import * as fleetService from '@/services/fleetService'
import * as analyticsService from '@/services/analyticsService'
import * as activityService from '@/services/activityService'

export function FleetManagerDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([fleetService.getVehicles(), analyticsService.getAnalyticsSummary(), activityService.getActivity()])
      .then(([vehicles, summary, activity]) => {
        if (!active) return
        setData({ vehicles, summary, activity })
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

  const { vehicles, summary, activity } = data
  const total = vehicles.length
  const available = vehicles.filter((v) => v.status === VEHICLE_STATUS.AVAILABLE).length
  const onTrip = vehicles.filter((v) => v.status === VEHICLE_STATUS.ON_TRIP).length
  const inShop = vehicles.filter((v) => v.status === VEHICLE_STATUS.IN_SHOP).length
  const retired = vehicles.filter((v) => v.status === VEHICLE_STATUS.RETIRED).length
  const activeVehicles = vehicles.filter((v) => v.status !== VEHICLE_STATUS.RETIRED)
  const avgUtilisation = activeVehicles.length
    ? Math.round(activeVehicles.reduce((s, v) => s + v.utilisation, 0) / activeVehicles.length)
    : 0

  const recentActivity = activity.map((a) => ({
    id: a.id,
    actor: a.actorName,
    role: ROLE_LABELS[a.actorRole] ?? a.actorRole,
    action: a.action,
    timestamp: a.timestamp,
  }))
  const fleetActivity = recentActivity.filter(
    (a) => a.role === ROLE_LABELS.fleet_manager || a.action.includes('vehicle') || a.action.includes('maintenance')
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Truck} label="Total Fleet" value={total} accent="brand" />
        <StatCard icon={CheckCircle2} label="Available" value={available} accent="emerald" />
        <StatCard icon={Route} label="On Trip" value={onTrip} accent="blue" />
        <StatCard icon={Wrench} label="In Maintenance" value={inShop} accent="amber" />
        <StatCard icon={Archive} label="Retired" value={retired} accent="slate" />
        <StatCard icon={Gauge} label="Fleet Utilisation" value={`${avgUtilisation}%`} accent="violet" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Maintenance Trend (Cost, ₹)">
          <LineChart data={summary.maintenanceTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, borderColor: '#e2e8f0' }} />
            <Line type="monotone" dataKey="cost" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>

        {summary.underutilisedVehicles.length === 0 ? (
          <EmptyChartCard title="Underutilised Vehicles" description="Vehicles trending below target utilisation" />
        ) : (
          <ChartCard title="Underutilised Vehicles">
            <BarChart data={summary.underutilisedVehicles} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" unit="%" />
              <YAxis type="category" dataKey="vehicle" width={140} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, borderColor: '#e2e8f0' }} />
              <Bar dataKey="utilisation" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartCard>
        )}
      </div>

      <RecentActivityList items={fleetActivity.length ? fleetActivity : recentActivity} title="Recent Fleet Activity" />
    </div>
  )
}
