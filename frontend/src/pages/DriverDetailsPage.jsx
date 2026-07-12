import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
  Phone,
  IdCard,
  MapPin,
  Gauge,
  CalendarDays,
  Route as RouteIcon,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { StatusBadge, Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PermissionGate } from '@/components/common/PermissionGate'
import { Skeleton } from '@/components/common/Skeleton'
import { DocumentsCard } from '@/components/documents/DocumentsCard'
import { usePermissions } from '@/hooks/usePermissions'
import { useToast } from '@/hooks/useToast'
import { MODULES, ACTIONS, ACCESS_LEVELS } from '@/config/permissions'
import { getDriverById, updateDriverStatus } from '@/services/driverService'
import { DRIVER_STATUS, DRIVER_STATUS_LABELS, isLicenceExpiringSoon, isLicenceExpired } from '@/data/drivers'
import { formatDate } from '@/utils/formatters'

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  )
}

export default function DriverDetailsPage() {
  const { driverId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { access } = usePermissions()
  const level = access(MODULES.DRIVERS)

  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmAction, setConfirmAction] = useState(null) // 'suspend' | 'reactivate' | null
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    getDriverById(driverId).then((data) => {
      setDriver(data)
      setLoading(false)
    })
  }, [driverId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  async function handleStatusChange(status) {
    setBusy(true)
    try {
      await updateDriverStatus(driverId, status)
      toast.success(`${driver?.name ?? 'Driver'} marked as ${DRIVER_STATUS_LABELS[status]}`)
      setConfirmAction(null)
      load()
    } catch {
      toast.error('Failed to update driver status. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!driver) {
    return (
      <EmptyState
        title="Driver not found"
        description="This driver record doesn't exist or may have been removed."
        action={
          <Button variant="secondary" onClick={() => navigate('/drivers')}>
            Back to Drivers
          </Button>
        }
      />
    )
  }

  const availabilityOnly = level === ACCESS_LEVELS.AVAILABILITY_VIEW
  const expired = isLicenceExpired(driver.licenceExpiry)
  const expiringSoon = !expired && isLicenceExpiringSoon(driver.licenceExpiry)
  const editHref = `/drivers/${driver.id}/edit`
  const isSuspended = driver.status === DRIVER_STATUS.SUSPENDED

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/drivers')}
            className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="size-3.5" /> Back to Drivers
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">{driver.name}</h1>
            <StatusBadge status={driver.status} label={DRIVER_STATUS_LABELS[driver.status]} />
          </div>
          <p className="text-sm text-slate-500">Driver ID: {driver.id}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Admin/Safety Officer get full EDIT; Fleet Manager only gets
              EDIT_OPERATIONAL (contact only). Branch on access level so the
              two never both render (Admin's canDo bypasses all checks). */}
          {level === ACCESS_LEVELS.FULL ? (
            <PermissionGate module={MODULES.DRIVERS} action={ACTIONS.EDIT}>
              <Link to={editHref}>
                <Button variant="secondary">
                  <Pencil className="size-4" />
                  Edit Driver
                </Button>
              </Link>
            </PermissionGate>
          ) : (
            <PermissionGate module={MODULES.DRIVERS} action={ACTIONS.EDIT_OPERATIONAL}>
              <Link to={editHref}>
                <Button variant="secondary">
                  <Pencil className="size-4" />
                  Edit Contact
                </Button>
              </Link>
            </PermissionGate>
          )}

          {!isSuspended && (
            <PermissionGate module={MODULES.DRIVERS} action={ACTIONS.MARK_AVAILABLE}>
              <Button
                variant="secondary"
                disabled={driver.status === DRIVER_STATUS.AVAILABLE}
                onClick={() => handleStatusChange(DRIVER_STATUS.AVAILABLE)}
              >
                <UserCheck className="size-4" />
                Mark Available
              </Button>
            </PermissionGate>
          )}

          {!isSuspended && (
            <PermissionGate module={MODULES.DRIVERS} action={ACTIONS.MARK_OFF_DUTY}>
              <Button
                variant="secondary"
                disabled={driver.status === DRIVER_STATUS.OFF_DUTY}
                onClick={() => handleStatusChange(DRIVER_STATUS.OFF_DUTY)}
              >
                <UserX className="size-4" />
                Mark Off Duty
              </Button>
            </PermissionGate>
          )}

          {isSuspended ? (
            <PermissionGate module={MODULES.DRIVERS} action={ACTIONS.REACTIVATE}>
              <Button onClick={() => setConfirmAction('reactivate')}>
                <ShieldCheck className="size-4" />
                Reactivate
              </Button>
            </PermissionGate>
          ) : (
            <PermissionGate module={MODULES.DRIVERS} action={ACTIONS.SUSPEND}>
              <Button variant="danger" onClick={() => setConfirmAction('suspend')}>
                <ShieldOff className="size-4" />
                Suspend
              </Button>
            </PermissionGate>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Driver Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DetailItem icon={IdCard} label="Driver ID" value={driver.id} />
              <DetailItem icon={MapPin} label="Region" value={driver.region} />
              {!availabilityOnly && <DetailItem icon={Phone} label="Contact" value={driver.contact} />}
              {!availabilityOnly && <DetailItem icon={IdCard} label="Licence Number" value={driver.licenceNumber} />}
              <DetailItem label="Licence Category" value={driver.licenceCategory} />
              {!availabilityOnly && (
                <DetailItem
                  icon={CalendarDays}
                  label="Licence Expiry"
                  value={
                    <span className="inline-flex flex-wrap items-center gap-2">
                      {formatDate(driver.licenceExpiry)}
                      {expired && <Badge color="red">Expired</Badge>}
                      {expiringSoon && <Badge color="amber">Expiring soon</Badge>}
                    </span>
                  }
                />
              )}
              {!availabilityOnly && <DetailItem icon={Gauge} label="Safety Score" value={`${driver.safetyScore} / 100`} />}
              <DetailItem icon={CalendarDays} label="Joined On" value={formatDate(driver.joinedOn)} />
              {!availabilityOnly && <DetailItem icon={RouteIcon} label="Trips Completed" value={driver.tripsCompleted} />}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trip History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {driver.currentAssignment ? (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                Currently assigned to <span className="font-medium">{driver.currentAssignment}</span>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No active trip assignment.</p>
            )}
            <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
              <span className="text-slate-500">Total trips completed</span>
              <span className="font-semibold text-slate-900">{driver.tripsCompleted}</span>
            </div>
            <p className="text-xs text-slate-400">Detailed trip logs are available in the Trips module.</p>
          </CardContent>
        </Card>
      </div>

      <DocumentsCard ownerType="driver" ownerId={driver.id} />

      <ConfirmDialog
        open={confirmAction === 'suspend'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleStatusChange(DRIVER_STATUS.SUSPENDED)}
        title="Suspend driver?"
        description={`${driver.name} will be unable to receive new trip assignments until reactivated.`}
        confirmLabel="Suspend"
        tone="danger"
        loading={busy}
      />
      <ConfirmDialog
        open={confirmAction === 'reactivate'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleStatusChange(DRIVER_STATUS.AVAILABLE)}
        title="Reactivate driver?"
        description={`${driver.name} will be marked available and eligible for new trip assignments.`}
        confirmLabel="Reactivate"
        tone="reactivate"
        loading={busy}
      />
    </div>
  )
}
