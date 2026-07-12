import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Archive, Pencil, Truck, Wallet, TrendingUp, Gauge } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PermissionGate } from '@/components/common/PermissionGate'
import { Skeleton } from '@/components/common/Skeleton'
import { DocumentsCard } from '@/components/documents/DocumentsCard'
import { MODULES, ACTIONS, ACCESS_LEVELS } from '@/config/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { useToast } from '@/hooks/useToast'
import { VEHICLE_STATUS_LABELS } from '@/data/vehicles'
import { formatCurrency, formatNumber, formatPercent, formatDate } from '@/utils/formatters'
import * as fleetService from '@/services/fleetService'

export default function VehicleDetailsPage() {
  const { vehicleId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { access } = usePermissions()
  const accessLevel = access(MODULES.FLEET)

  const [vehicle, setVehicle] = useState(undefined) // undefined = loading, null = not found
  const [confirmRetireOpen, setConfirmRetireOpen] = useState(false)
  const [retiring, setRetiring] = useState(false)

  useEffect(() => {
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVehicle(undefined)
    fleetService.getVehicleById(vehicleId).then((data) => {
      if (active) setVehicle(data ?? null)
    })
    return () => {
      active = false
    }
  }, [vehicleId])

  async function handleRetireConfirm() {
    if (!vehicle) return
    setRetiring(true)
    try {
      await fleetService.retireVehicle(vehicle.id)
      toast.success(`${vehicle.registration} has been retired.`)
      setConfirmRetireOpen(false)
      navigate('/fleet')
    } catch {
      toast.error('Failed to retire vehicle. Please try again.')
    } finally {
      setRetiring(false)
    }
  }

  if (vehicle === undefined) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (vehicle === null) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <EmptyState
          icon={Truck}
          title="Vehicle not found"
          description="This vehicle may have been removed or the link is incorrect."
          action={
            <Link to="/fleet">
              <Button variant="secondary">
                <ArrowLeft className="size-4" />
                Back to Fleet
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  const hideFinancials = accessLevel === ACCESS_LEVELS.VIEW
  const financialFocus = accessLevel === ACCESS_LEVELS.FINANCIAL_VIEW

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/fleet" className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700">
            <ArrowLeft className="size-3.5" />
            Back to Fleet
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">{vehicle.registration}</h1>
            <StatusBadge status={vehicle.status} label={VEHICLE_STATUS_LABELS[vehicle.status]} />
          </div>
          <p className="text-sm text-slate-500">{vehicle.model}</p>
        </div>
        <div className="flex items-center gap-2">
          <PermissionGate module={MODULES.FLEET} action={ACTIONS.EDIT}>
            <Link to={`/fleet/${vehicle.id}/edit`}>
              <Button variant="secondary">
                <Pencil className="size-4" />
                Edit
              </Button>
            </Link>
          </PermissionGate>
          <PermissionGate module={MODULES.FLEET} action={ACTIONS.RETIRE}>
            <Button variant="dangerOutline" onClick={() => setConfirmRetireOpen(true)} disabled={vehicle.status === 'retired'}>
              <Archive className="size-4" />
              Retire Vehicle
            </Button>
          </PermissionGate>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Vehicle profile</CardTitle>
              <CardDescription>Operational details and specifications.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <DetailRow label="Registration" value={vehicle.registration} />
              <DetailRow label="Model" value={vehicle.model} />
              <DetailRow label="Type" value={vehicle.type} />
              <DetailRow label="Region" value={vehicle.region} />
              <DetailRow label="Capacity" value={`${formatNumber(vehicle.capacityKg)} kg`} />
              <DetailRow label="Odometer" value={`${formatNumber(vehicle.odometerKm)} km`} />
              <DetailRow label="Purchased on" value={formatDate(vehicle.purchasedOn)} />
              <DetailRow
                label="Status"
                value={<StatusBadge status={vehicle.status} label={VEHICLE_STATUS_LABELS[vehicle.status]} />}
              />
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Utilisation</CardTitle>
                <CardDescription>Current usage rate</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Gauge className="size-5" />
                </span>
                <p className="text-2xl font-semibold text-slate-900">{formatPercent(vehicle.utilisation)}</p>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${vehicle.utilisation}%` }} />
              </div>
            </CardContent>
          </Card>

          {!hideFinancials && (
            <Card className={financialFocus ? 'ring-2 ring-brand-500/40' : undefined}>
              <CardHeader>
                <div>
                  <CardTitle>Financial Summary</CardTitle>
                  <CardDescription>Cost & return performance</CardDescription>
                </div>
                <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Wallet className="size-4.5" />
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                <SummaryRow label="Acquisition cost" value={formatCurrency(vehicle.acquisitionCost)} />
                <SummaryRow label="Monthly operational cost" value={formatCurrency(vehicle.operationalCostMonthly)} />
                <SummaryRow
                  label="Return on investment"
                  value={
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <TrendingUp className="size-3.5" />
                      {formatPercent(vehicle.roi, 1)}
                    </span>
                  }
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <DocumentsCard ownerType="vehicle" ownerId={vehicle.id} />

      <ConfirmDialog
        open={confirmRetireOpen}
        onClose={() => setConfirmRetireOpen(false)}
        onConfirm={handleRetireConfirm}
        loading={retiring}
        tone="danger"
        title="Retire this vehicle?"
        description={`${vehicle.registration} (${vehicle.model}) will be marked as retired and removed from active dispatch. This cannot be undone.`}
        confirmLabel="Retire Vehicle"
      />
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{value}</dd>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  )
}
