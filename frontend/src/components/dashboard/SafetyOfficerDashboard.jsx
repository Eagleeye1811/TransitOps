import { Link } from 'react-router-dom'
import { ShieldAlert, ShieldX, UserX, UserCheck, Gauge, AlertOctagon } from 'lucide-react'
import { StatCard } from './StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { StatusBadge, Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { DRIVERS, DRIVER_STATUS, isLicenceExpired, isLicenceExpiringSoon, getDriverById } from '@/data/drivers'
import { SAFETY_INCIDENTS, INCIDENT_SEVERITY_LABELS } from '@/data/incidents'
import { formatDate, timeAgo } from '@/utils/formatters'

export function SafetyOfficerDashboard() {
  const expiring = DRIVERS.filter((d) => isLicenceExpiringSoon(d.licenceExpiry))
  const expired = DRIVERS.filter((d) => isLicenceExpired(d.licenceExpiry))
  const suspended = DRIVERS.filter((d) => d.status === DRIVER_STATUS.SUSPENDED)
  const onDuty = DRIVERS.filter((d) => d.status === DRIVER_STATUS.AVAILABLE || d.status === DRIVER_STATUS.ON_TRIP)
  const avgScore = Math.round(DRIVERS.reduce((s, d) => s + d.safetyScore, 0) / DRIVERS.length)

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
            {SAFETY_INCIDENTS.length === 0 ? (
              <EmptyState icon={AlertOctagon} title="No incidents recorded" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {SAFETY_INCIDENTS.slice(0, 5).map((incident) => {
                  const driver = getDriverById(incident.driverId)
                  return (
                    <li key={incident.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800">{incident.type}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
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
        <Link to={`/drivers/${driver.id}`} className="text-sm font-medium text-slate-800 hover:text-brand-600">
          {driver.name}
        </Link>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
      <StatusBadge status={tone === 'red' ? 'expired' : 'expiring'} label={tone === 'red' ? 'Urgent' : 'Warning'} />
    </div>
  )
}
