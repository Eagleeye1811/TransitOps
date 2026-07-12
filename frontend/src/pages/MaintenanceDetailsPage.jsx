import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, CheckCircle2, XCircle, Wrench } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { PermissionGate } from '@/components/common/PermissionGate'
import { MaintenanceForm } from '@/components/maintenance/MaintenanceForm'
import { useToast } from '@/hooks/useToast'
import { MODULES, ACTIONS } from '@/config/permissions'
import { MAINTENANCE_STATUS, MAINTENANCE_STATUS_LABELS } from '@/data/maintenance'
import { getVehicleById } from '@/data/vehicles'
import { formatCurrency, formatDate } from '@/utils/formatters'
import * as maintenanceService from '@/services/maintenanceService'

export default function MaintenanceDetailsPage() {
  const { maintenanceId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null) // 'complete' | 'cancel'
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    maintenanceService.getMaintenanceById(maintenanceId).then((data) => {
      if (!cancelled) {
        setRecord(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [maintenanceId])

  if (loading) return null

  if (!record) {
    return (
      <EmptyState
        icon={Wrench}
        title="Maintenance record not found"
        description="This record may have been removed, or the link is incorrect."
        action={
          <Button variant="secondary" onClick={() => navigate('/maintenance')}>
            <ArrowLeft className="size-4" />
            Back to Maintenance
          </Button>
        }
      />
    )
  }

  const vehicle = getVehicleById(record.vehicleId)
  const isOpen = record.status === MAINTENANCE_STATUS.SCHEDULED || record.status === MAINTENANCE_STATUS.IN_SHOP

  async function handleEditSubmit(payload) {
    setSubmitting(true)
    try {
      const updated = await maintenanceService.updateMaintenanceRecord(record.id, payload)
      setRecord(updated)
      toast.success('Maintenance record updated.')
      setEditOpen(false)
    } catch {
      toast.error('Could not update maintenance record.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirm() {
    setSubmitting(true)
    try {
      const updated =
        confirmAction === 'complete'
          ? await maintenanceService.completeMaintenanceRecord(record.id)
          : await maintenanceService.cancelMaintenanceRecord(record.id)
      setRecord(updated)
      toast.success(confirmAction === 'complete' ? 'Marked as completed.' : 'Maintenance cancelled.')
      setConfirmAction(null)
    } catch {
      toast.error('Could not update status.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/maintenance" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft className="size-4" />
        Back to Maintenance
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{record.serviceType}</h1>
          <p className="text-sm text-slate-500">{record.id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={record.status} label={MAINTENANCE_STATUS_LABELS[record.status]} />
          <PermissionGate module={MODULES.MAINTENANCE} action={ACTIONS.EDIT}>
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="size-3.5" />
              Edit
            </Button>
          </PermissionGate>
          {isOpen && (
            <PermissionGate module={MODULES.MAINTENANCE} action={ACTIONS.COMPLETE}>
              <Button
                variant="secondary"
                size="sm"
                className="text-emerald-700"
                onClick={() => setConfirmAction('complete')}
              >
                <CheckCircle2 className="size-3.5" />
                Mark Completed
              </Button>
            </PermissionGate>
          )}
          {isOpen && (
            <PermissionGate module={MODULES.MAINTENANCE} action={ACTIONS.CANCEL}>
              <Button variant="dangerOutline" size="sm" onClick={() => setConfirmAction('cancel')}>
                <XCircle className="size-3.5" />
                Cancel
              </Button>
            </PermissionGate>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Registration</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{vehicle?.registration ?? record.vehicleId}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Model</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{vehicle?.model ?? '—'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</p>
            <p className="mt-1 text-sm text-slate-700">{record.description}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Cost</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{formatCurrency(record.cost)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
            <p className="mt-1">
              <StatusBadge status={record.status} label={MAINTENANCE_STATUS_LABELS[record.status]} />
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Service Date</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(record.serviceDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Expected Completion</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(record.expectedCompletionDate)}</p>
          </div>
        </CardContent>
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Maintenance Record" size="lg">
        <MaintenanceForm
          mode="edit"
          initialValues={record}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditOpen(false)}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        loading={submitting}
        tone={confirmAction === 'cancel' ? 'danger' : 'default'}
        title={confirmAction === 'complete' ? 'Mark maintenance as completed?' : 'Cancel this maintenance record?'}
        description={
          confirmAction === 'complete'
            ? 'This will mark the service as completed.'
            : 'This will cancel the scheduled/in-progress maintenance. This action cannot be undone.'
        }
        confirmLabel={confirmAction === 'complete' ? 'Mark Completed' : 'Cancel Maintenance'}
        cancelLabel="Go Back"
      />
    </div>
  )
}
