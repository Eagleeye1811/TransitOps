import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { Skeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { DriverForm } from '@/components/drivers/DriverForm'
import { usePermissions } from '@/hooks/usePermissions'
import { useToast } from '@/hooks/useToast'
import { MODULES, ACCESS_LEVELS } from '@/config/permissions'
import { getDriverById, createDriver, updateDriver } from '@/services/driverService'

export default function DriverFormPage() {
  const { driverId } = useParams()
  const isEdit = Boolean(driverId)
  const navigate = useNavigate()
  const toast = useToast()
  const { access } = usePermissions()
  const level = access(MODULES.DRIVERS)

  // Fleet Manager (operational_view) editing an existing driver can only
  // touch the contact field. Adding a brand-new driver is only reachable by
  // full-access roles (CREATE isn't granted to Fleet Manager), so the add
  // form always renders in full mode.
  const mode = isEdit && level === ACCESS_LEVELS.OPERATIONAL_VIEW ? 'operational' : 'full'
  const allowed = level === ACCESS_LEVELS.FULL || level === ACCESS_LEVELS.OPERATIONAL_VIEW

  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    getDriverById(driverId).then((data) => {
      if (!active) return
      setDriver(data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [driverId, isEdit])

  async function handleSubmit(payload) {
    setSubmitting(true)
    try {
      if (isEdit) {
        await updateDriver(driverId, payload)
        toast.success('Driver updated successfully')
        navigate(`/drivers/${driverId}`)
      } else {
        const created = await createDriver(payload)
        toast.success('Driver added successfully')
        navigate(`/drivers/${created.id}`)
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!allowed) {
    return (
      <EmptyState
        title="You don't have access to this page"
        description="Contact an administrator if you believe this is a mistake."
        action={
          <Button variant="secondary" onClick={() => navigate('/drivers')}>
            Back to Drivers
          </Button>
        }
      />
    )
  }

  if (isEdit && loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isEdit && !driver) {
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          {isEdit ? `Edit Driver — ${driver.name}` : 'Add Driver'}
        </h1>
        <p className="text-sm text-slate-500">
          {isEdit
            ? mode === 'operational'
              ? 'Only the contact number can be updated from this view.'
              : 'Update driver record details.'
            : 'Create a new driver record.'}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Driver Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DriverForm
            initialValues={isEdit ? driver : undefined}
            onSubmit={handleSubmit}
            submitting={submitting}
            mode={isEdit ? mode : 'full'}
            submitLabel={isEdit ? 'Save Changes' : 'Add Driver'}
            onCancel={() => navigate(isEdit ? `/drivers/${driverId}` : '/drivers')}
          />
        </CardContent>
      </Card>
    </div>
  )
}
