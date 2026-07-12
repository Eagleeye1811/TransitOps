import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import { TableContainer, THead, TBody, TR, TH, TD } from '@/components/common/Table'
import { IconButton } from '@/components/common/Button'
import { StatusBadge } from '@/components/common/Badge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { PermissionGate } from '@/components/common/PermissionGate'
import { usePermissions } from '@/hooks/usePermissions'
import { MODULES, ACTIONS } from '@/config/permissions'
import { ROLES } from '@/config/roles'
import { MAINTENANCE_STATUS, MAINTENANCE_STATUS_LABELS } from '@/data/maintenance'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Wrench } from 'lucide-react'

/**
 * Responsive maintenance records table. Cost column is omitted entirely for
 * the Dispatcher role (status-focused, no cost visibility). Complete/Cancel
 * quick actions are gated on the relevant permission and only shown for
 * records that are still open (scheduled/in_shop). `vehicles` is a Map
 * keyed by id, fetched once by the parent page.
 */
export function MaintenanceTable({ records, vehicles = new Map(), onComplete, onCancel }) {
  const navigate = useNavigate()
  const { role } = usePermissions()
  const showCost = role !== ROLES.DISPATCHER
  const [pendingAction, setPendingAction] = useState(null) // { type: 'complete'|'cancel', record }
  const [submitting, setSubmitting] = useState(false)

  if (!records.length) {
    return (
      <EmptyState
        icon={Wrench}
        title="No maintenance records found"
        description="Try adjusting your filters, or add a new maintenance record."
      />
    )
  }

  async function handleConfirm() {
    if (!pendingAction) return
    setSubmitting(true)
    try {
      if (pendingAction.type === 'complete') {
        await onComplete?.(pendingAction.record)
      } else {
        await onCancel?.(pendingAction.record)
      }
      setPendingAction(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <TableContainer>
        <THead>
          <TR>
            <TH>Vehicle</TH>
            <TH>Service Type</TH>
            <TH>Service Date</TH>
            <TH>Expected Completion</TH>
            <TH>Status</TH>
            {showCost && <TH className="text-right">Cost</TH>}
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {records.map((record) => {
            const vehicle = vehicles.get(record.vehicleId)
            const isOpen = record.status === MAINTENANCE_STATUS.SCHEDULED || record.status === MAINTENANCE_STATUS.IN_SHOP
            return (
              <TR key={record.id} onClick={() => navigate(`/maintenance/${record.id}`)}>
                <TD>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{vehicle?.registration ?? record.vehicleId}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{vehicle?.model ?? '—'}</div>
                </TD>
                <TD>{record.serviceType}</TD>
                <TD>{formatDate(record.serviceDate)}</TD>
                <TD>{formatDate(record.expectedCompletionDate)}</TD>
                <TD>
                  <StatusBadge status={record.status} label={MAINTENANCE_STATUS_LABELS[record.status]} />
                </TD>
                {showCost && <TD className="text-right font-medium text-slate-900 dark:text-slate-100">{formatCurrency(record.cost)}</TD>}
                <TD className="text-right">
                  {isOpen && (
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <PermissionGate module={MODULES.MAINTENANCE} action={ACTIONS.COMPLETE}>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          aria-label="Mark completed"
                          className="text-emerald-600 hover:bg-emerald-50"
                          onClick={() => setPendingAction({ type: 'complete', record })}
                        >
                          <CheckCircle2 className="size-4" />
                        </IconButton>
                      </PermissionGate>
                      <PermissionGate module={MODULES.MAINTENANCE} action={ACTIONS.CANCEL}>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          aria-label="Cancel maintenance"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setPendingAction({ type: 'cancel', record })}
                        >
                          <XCircle className="size-4" />
                        </IconButton>
                      </PermissionGate>
                    </div>
                  )}
                </TD>
              </TR>
            )
          })}
        </TBody>
      </TableContainer>

      <ConfirmDialog
        open={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={handleConfirm}
        loading={submitting}
        tone={pendingAction?.type === 'cancel' ? 'danger' : 'default'}
        title={pendingAction?.type === 'complete' ? 'Mark maintenance as completed?' : 'Cancel this maintenance record?'}
        description={
          pendingAction?.type === 'complete'
            ? 'This will mark the service as completed. This action can be reviewed later from the record details.'
            : 'This will cancel the scheduled/in-progress maintenance. This action cannot be undone.'
        }
        confirmLabel={pendingAction?.type === 'complete' ? 'Mark Completed' : 'Cancel Maintenance'}
        cancelLabel="Go Back"
      />
    </>
  )
}
