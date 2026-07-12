import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { MaintenanceForm } from '@/components/maintenance/MaintenanceForm'
import { useToast } from '@/hooks/useToast'
import * as maintenanceService from '@/services/maintenanceService'
import * as fleetService from '@/services/fleetService'

export default function MaintenanceFormPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [vehicles, setVehicles] = useState([])

  useEffect(() => {
    let active = true
    fleetService.getVehicles().then((data) => {
      if (active) setVehicles(data)
    })
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(payload) {
    setSubmitting(true)
    try {
      const record = await maintenanceService.createMaintenanceRecord(payload)
      toast.success('Maintenance record created.')
      navigate(`/maintenance/${record.id}`)
    } catch {
      toast.error('Could not create maintenance record. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add Maintenance Record</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Schedule a new service or repair for a vehicle.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <MaintenanceForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/maintenance')}
            submitting={submitting}
            vehicles={vehicles}
          />
        </CardContent>
      </Card>
    </div>
  )
}
