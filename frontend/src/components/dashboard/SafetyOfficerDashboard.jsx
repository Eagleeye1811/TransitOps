import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ShieldX, UserX, UserCheck, Gauge, AlertOctagon } from 'lucide-react'
import { StatCard } from './StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { StatusBadge, Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { CardSkeleton } from '@/components/common/Skeleton'
import { DRIVER_STATUS, isLicenceExpired, isLicenceExpiringSoon } from '@/data/drivers'
import { INCIDENT_SEVERITY_LABELS } from '@/data/incidents'
import { formatDate, timeAgo } from '@/utils/formatters'
import * as driverService from '@/services/driverService'
import * as safetyService from '@/services/safetyService'

export function SafetyOfficerDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([driverService.getDrivers(), safetyService.getIncidents()])
      .then(([drivers, incidents]) => {
        if (!active) return
        setData({ drivers, incidents })
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

  const { drivers, incidents } = data
  const driversById = new Map(drivers.map((d) => [d.id, d]))

  const expiring = drivers.filter((d) => isLicenceExpiringSoon(d.licenceExpiry))
  const expired = drivers.filter((d) => isLicenceExpired(d.licenceExpiry))
  const suspended = drivers.filter((d) => d.status === DRIVER_STATUS.SUSPENDED)
  const onDuty = drivers.filter((d) => d.status === DRIVER_STATUS.AVAILABLE || d.status === DRIVER_STATUS.ON_TRIP)
  const avgScore = drivers.length ? Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={ShieldAlert} label="Expiring Licences" value={expiring.length} accent="amber" />
        <StatCard icon={ShieldX} label="Expired Licences" value={expired.length} accent="red" />
        <StatCard icon={UserX} label="Suspended Drivers" value={suspended.length} accent="red" />
        <StatCard icon={UserCheck} label="Drivers on Duty" value={onDuty.length} accent="emerald" />
        <StatCard icon={Gauge} label="Avg. Safety Score" value={avgScore} accent="violet" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Alerts</CardTitle>
            <Link to="/compliance" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiring.length === 0 && expired.length === 0 && suspended.length === 0 ? (
              <EmptyState icon={ShieldAlert} title="No compliance alerts" />
            ) : (
              <>
                {expired.map((d) => (
                  <AlertRow key={d.id} driver={d} label={`Licence expired ${formatDate(d.licenceExpiry)}`} tone="red" />
                ))}
                {expiring.map((d) => (
                  <AlertRow key={d.id} driver={d} label={`Licence expires ${formatDate(d.licenceExpiry)}`} tone="amber" />
                ))}
                {suspended.map((d) => (
                  <AlertRow key={d.id} driver={d} label="Currently suspended" tone="red" />
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Safety Incidents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {incidents.length === 0 ? (
              <EmptyState icon={AlertOctagon} title="No incidents recorded" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {incidents.slice(0, 5).map((incident) => {
                  const driver = driversById.get(incident.driverId)
                  return (
                    <li key={incident.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{incident.type}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {driver?.name} &middot; {timeAgo(incident.date)}
                        </p>
                      </div>
                      <Badge color={incident.severity === 'high' ? 'red' : incident.severity === 'medium' ? 'amber' : 'gray'}>
                        {INCIDENT_SEVERITY_LABELS[incident.severity]}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AlertRow({ driver, label, tone }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3.5 py-2.5">
      <div>
        <Link to={`/drivers/${driver.id}`} className="text-sm font-medium text-slate-800 hover:text-brand-600 dark:text-slate-200">
          {driver.name}
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      <StatusBadge status={tone === 'red' ? 'expired' : 'expiring'} label={tone === 'red' ? 'Urgent' : 'Warning'} />
    </div>
  )
}
