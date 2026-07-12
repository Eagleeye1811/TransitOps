import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Route as RouteIcon,
  Send,
  CheckCircle2,
  XCircle,
  Pencil,
  ArrowLeft,
  MapPin,
  Package,
  Gauge,
  Calendar,
  Clock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '@/components/common/Badge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { PermissionGate } from '@/components/common/PermissionGate'
import { Field, Textarea } from '@/components/common/FormControls'
import { TripLifecycle } from '@/components/trips/TripLifecycle'
import { TripRouteMap } from '@/components/trips/TripRouteMap'
import { MODULES, ACTIONS } from '@/config/permissions'
import { TRIP_STATUS, TRIP_STATUS_LABELS } from '@/data/trips'
import * as tripService from '@/services/tripService'
import * as fleetService from '@/services/fleetService'
import * as driverService from '@/services/driverService'
import { useToast } from '@/hooks/useToast'
import { formatDate, formatDateTime } from '@/utils/formatters'

export default function TripDetailsPage() {
  const { tripId } = useParams()
  const toast = useToast()

  const [trip, setTrip] = useState(null)
  const [vehicle, setVehicle] = useState(null)
  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [dispatchOpen, setDispatchOpen] = useState(false)
  const [dispatchLoading, setDispatchLoading] = useState(false)
  const [dispatchErrors, setDispatchErrors] = useState([])

  const [completeOpen, setCompleteOpen] = useState(false)
  const [completeLoading, setCompleteLoading] = useState(false)

  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const t = await tripService.getTripById(tripId)
    if (!t) {
      setTrip(null)
      setNotFound(true)
      setLoading(false)
      return
    }
    setNotFound(false)
    setTrip(t)
    const [v, d] = await Promise.all([
      t.vehicleId ? fleetService.getVehicleById(t.vehicleId) : Promise.resolve(null),
      t.driverId ? driverService.getDriverById(t.driverId) : Promise.resolve(null),
    ])
    setVehicle(v)
    setDriver(d)
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  async function handleDispatch() {
    setDispatchLoading(true)
    const result = await tripService.dispatchTrip(tripId)
    setDispatchLoading(false)
    if (result.success) {
      setDispatchOpen(false)
      setDispatchErrors([])
      toast.success(`${tripId} dispatched.`)
      load()
    } else {
      setDispatchErrors(result.errors ?? [])
      toast.error('Trip could not be dispatched.')
    }
  }

  async function handleComplete() {
    setCompleteLoading(true)
    await tripService.completeTrip(tripId)
    setCompleteLoading(false)
    setCompleteOpen(false)
    toast.success(`${tripId} marked as completed.`)
    load()
  }

  async function handleCancel() {
    setCancelLoading(true)
    await tripService.cancelTrip(tripId, cancelReason.trim() || 'No reason provided')
    setCancelLoading(false)
    setCancelOpen(false)
    setCancelReason('')
    toast.success(`${tripId} cancelled.`)
    load()
  }

  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-400">Loading trip…</div>
  }

  if (notFound || !trip) {
    return (
      <EmptyState
        icon={RouteIcon}
        title="Trip not found"
        description="This trip may have been removed or the link is incorrect."
        action={
          <Link to="/trips">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="size-4" />
              Back to Trips
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900">{trip.id}</h1>
            <StatusBadge status={trip.status} label={TRIP_STATUS_LABELS[trip.status]} />
          </div>
          <p className="mt-0.5 text-sm text-slate-500">
            {trip.source} → {trip.destination}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {trip.status === TRIP_STATUS.DRAFT && (
            <PermissionGate module={MODULES.TRIPS} action={ACTIONS.EDIT}>
              <Link to={`/trips/${trip.id}/edit`}>
                <Button variant="secondary" size="sm">
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </Link>
            </PermissionGate>
          )}
          {trip.status === TRIP_STATUS.DRAFT && (
            <PermissionGate module={MODULES.TRIPS} action={ACTIONS.DISPATCH}>
              <Button
                size="sm"
                onClick={() => {
                  setDispatchErrors([])
                  setDispatchOpen(true)
                }}
              >
                <Send className="size-4" />
                Dispatch
              </Button>
            </PermissionGate>
          )}
          {trip.status === TRIP_STATUS.DISPATCHED && (
            <PermissionGate module={MODULES.TRIPS} action={ACTIONS.COMPLETE}>
              <Button size="sm" onClick={() => setCompleteOpen(true)}>
                <CheckCircle2 className="size-4" />
                Complete
              </Button>
            </PermissionGate>
          )}
          {(trip.status === TRIP_STATUS.DRAFT || trip.status === TRIP_STATUS.DISPATCHED) && (
            <PermissionGate module={MODULES.TRIPS} action={ACTIONS.CANCEL}>
              <Button variant="dangerOutline" size="sm" onClick={() => setCancelOpen(true)}>
                <XCircle className="size-4" />
                Cancel
              </Button>
            </PermissionGate>
          )}
        </div>
      </div>

      <Card>
        <CardContent>
          <TripLifecycle status={trip.status} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trip details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem icon={MapPin} label="Source" value={trip.source} />
            <DetailItem icon={MapPin} label="Destination" value={trip.destination} />
            <DetailItem icon={Package} label="Cargo weight" value={`${trip.cargoWeightKg} kg`} />
            <DetailItem icon={Gauge} label="Planned distance" value={`${trip.plannedDistanceKm} km`} />
            <DetailItem icon={Calendar} label="Scheduled date" value={formatDate(trip.scheduledDate)} />
            <DetailItem icon={Clock} label="Scheduled time" value={trip.scheduledTime} />
            <DetailItem label="Region" value={trip.region} />
            {trip.status === TRIP_STATUS.DISPATCHED && (
              <DetailItem label="ETA" value={trip.etaMinutes ? `${trip.etaMinutes} min` : '—'} />
            )}
            {trip.dispatchedAt && <DetailItem label="Dispatched at" value={formatDateTime(trip.dispatchedAt)} />}
            {trip.completedAt && <DetailItem label="Completed at" value={formatDateTime(trip.completedAt)} />}
            <DetailItem label="Created" value={formatDateTime(trip.createdAt)} />
          </CardContent>
          {trip.status === TRIP_STATUS.CANCELLED && trip.cancelReason && (
            <CardContent className="border-t border-slate-100 bg-red-50/50">
              <p className="text-xs font-medium uppercase tracking-wide text-red-600">Cancellation reason</p>
              <p className="mt-1 text-sm text-slate-700">{trip.cancelReason}</p>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Vehicle</p>
              {vehicle ? (
                <div className="mt-1">
                  <p className="text-sm font-medium text-slate-900">{vehicle.registration}</p>
                  <p className="text-xs text-slate-500">{vehicle.model}</p>
                  <StatusBadge status={vehicle.status} className="mt-1.5" />
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-400">Not assigned</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Driver</p>
              {driver ? (
                <div className="mt-1">
                  <p className="text-sm font-medium text-slate-900">{driver.name}</p>
                  <p className="text-xs text-slate-500">Licence: {driver.licenceCategory}</p>
                  <StatusBadge status={driver.status} className="mt-1.5" />
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-400">Not assigned</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <TripRouteMap source={trip.source} destination={trip.destination} />

      <ConfirmDialog
        open={dispatchOpen}
        onClose={() => setDispatchOpen(false)}
        onConfirm={handleDispatch}
        title="Dispatch this trip?"
        description="The assigned vehicle and driver will be marked as on trip."
        confirmLabel="Dispatch"
        tone="warning"
        loading={dispatchLoading}
      >
        {dispatchErrors.length > 0 && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <ul className="list-disc space-y-0.5 pl-4">
              {dispatchErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        onConfirm={handleComplete}
        title="Mark trip as completed?"
        description="The assigned vehicle and driver will be freed up and marked available."
        confirmLabel="Complete"
        tone="warning"
        loading={completeLoading}
      />

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => {
          setCancelOpen(false)
          setCancelReason('')
        }}
        onConfirm={handleCancel}
        title="Cancel this trip?"
        description="This action cannot be undone."
        confirmLabel="Cancel Trip"
        tone="danger"
        loading={cancelLoading}
      >
        <Field label="Reason for cancellation" htmlFor="cancelReason" className="mt-3">
          <Textarea
            id="cancelReason"
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Vehicle went to shop"
          />
        </Field>
      </ConfirmDialog>
    </div>
  )
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-700">{value}</p>
    </div>
  )
}
