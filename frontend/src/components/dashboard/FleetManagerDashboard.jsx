import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'
import { Truck, CheckCircle2, Route, Wrench, Archive, Gauge } from 'lucide-react'
import { StatCard } from './StatCard'
import { RecentActivityList } from './RecentActivityList'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { VEHICLES, VEHICLE_STATUS } from '@/data/vehicles'
import { MAINTENANCE_TREND, UNDERUTILISED_VEHICLES } from '@/data/analytics'
import { RECENT_ACTIVITY } from '@/data/activity'

export function FleetManagerDashboard() {
  const total = VEHICLES.length
  const available = VEHICLES.filter((v) => v.status === VEHICLE_STATUS.AVAILABLE).length
  const onTrip = VEHICLES.filter((v) => v.status === VEHICLE_STATUS.ON_TRIP).length
  const inShop = VEHICLES.filter((v) => v.status === VEHICLE_STATUS.IN_SHOP).length
  const retired = VEHICLES.filter((v) => v.status === VEHICLE_STATUS.RETIRED).length
  const activeVehicles = VEHICLES.filter((v) => v.status !== VEHICLE_STATUS.RETIRED)
  const avgUtilisation = Math.round(activeVehicles.reduce((s, v) => s + v.utilisation, 0) / activeVehicles.length)

  const fleetActivity = RECENT_ACTIVITY.filter((a) => a.role === 'Fleet Manager' || a.action.includes('vehicle') || a.action.includes('maintenance'))

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
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Trend (Cost, ₹)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MAINTENANCE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, borderColor: '#e2e8f0' }} />
                <Line type="monotone" dataKey="cost" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Underutilised Vehicles</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={UNDERUTILISED_VEHICLES} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" unit="%" />
                <YAxis type="category" dataKey="vehicle" width={140} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, borderColor: '#e2e8f0' }} />
                <Bar dataKey="utilisation" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <RecentActivityList items={fleetActivity.length ? fleetActivity : RECENT_ACTIVITY} title="Recent Fleet Activity" />
    </div>
  )
}
