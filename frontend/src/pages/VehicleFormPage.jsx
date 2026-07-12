import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Ban } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'
import { VehicleForm } from '@/components/fleet/VehicleForm'
import { MODULES, ACTIONS } from '@/config/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { useToast } from '@/hooks/useToast'
import * as fleetService from '@/services/fleetService'

export default function VehicleFormPage() {
  const { vehicleId } = useParams()
  const isEdit = Boolean(vehicleId)
  const navigate = useNavigate()
  const toast = useToast()
  const { canDo } = usePermissions()

  const allowed = canDo(MODULES.FLEET, isEdit ? ACTIONS.EDIT : ACTIONS.CREATE)

  const [vehicle, setVehicle] = useState(isEdit ? undefined : null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVehicle(null)
      return
    }
    let active = true
    setVehicle(undefined)
    fleetService.getVehicleById(vehicleId).then((data) => {
      if (active) setVehicle(data ?? null)
    })
    return () => {
      active = false
    }
  }, [vehicleId, isEdit])

  async function handleSubmit(payload) {
    setSubmitting(true)
    try {
      if (isEdit) {
        const updated = await fleetService.updateVehicle(vehicleId, payload)
        toast.success(`${updated.registration} has been updated.`)
        navigate(`/fleet/${updated.id}`)
      } else {
        const created = await fleetService.createVehicle(payload)
        toast.success(`${created.registration} has been added to the fleet.`)
        navigate(`/fleet/${created.id}`)
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!allowed) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <EmptyState
          icon={Ban}
          title="You don't have permission to do this"
          description="Contact an administrator if you believe this is a mistake."
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

  if (isEdit && vehicle === undefined) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (isEdit && vehicle === null) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <EmptyState
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

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/fleet" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft className="size-3.5" />
        Back to Fleet
      </Link>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</CardTitle>
            <CardDescription>
              {isEdit ? `Update details for ${vehicle.registration}.` : 'Register a new vehicle in the fleet.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <VehicleForm
            initialValues={isEdit ? vehicle : undefined}
            isEdit={isEdit}
            vehicleId={isEdit ? vehicleId : null}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate(isEdit ? `/fleet/${vehicleId}` : '/fleet')}
          />
        </CardContent>
      </Card>
    </div>
  )
}
