import { useState } from 'react'
import { Pencil, Trash2, Fuel } from 'lucide-react'
import { TableContainer, THead, TBody, TR, TH, TD } from '@/components/common/Table'
import { IconButton } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { PermissionGate } from '@/components/common/PermissionGate'
import { MODULES, ACTIONS } from '@/config/permissions'
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters'

/** Fuel log table with gated edit/delete row actions. `vehicles` is a Map
 * keyed by id, fetched once by the parent page. */
export function FuelLogTable({ logs, vehicles = new Map(), onEdit, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!logs.length) {
    return (
      <EmptyState
        icon={Fuel}
        title="No fuel logs found"
        description="Try adjusting your filters, or log a new fuel purchase."
      />
    )
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    setSubmitting(true)
    try {
      await onDelete?.(pendingDelete)
      setPendingDelete(null)
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
            <TH>Date</TH>
            <TH className="text-right">Quantity (L)</TH>
            <TH className="text-right">Cost</TH>
            <TH className="text-right">Odometer (km)</TH>
            <TH>Station</TH>
            <TH>Receipt Ref</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {logs.map((log) => {
            const vehicle = vehicles.get(log.vehicleId)
            return (
              <TR key={log.id}>
                <TD>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{vehicle?.registration ?? log.vehicleId}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{vehicle?.model ?? '—'}</div>
                </TD>
                <TD>{formatDate(log.date)}</TD>
                <TD className="text-right">{formatNumber(log.quantityLitres)}</TD>
                <TD className="text-right font-medium text-slate-900 dark:text-slate-100">{formatCurrency(log.cost)}</TD>
                <TD className="text-right">{formatNumber(log.odometerKm)}</TD>
                <TD>{log.station}</TD>
                <TD>{log.receiptRef}</TD>
                <TD className="text-right">
                  <div className="flex justify-end gap-1">
                    <PermissionGate module={MODULES.EXPENSES} action={ACTIONS.EDIT}>
                      <IconButton size="sm" variant="ghost" aria-label="Edit fuel log" onClick={() => onEdit?.(log)}>
                        <Pencil className="size-4" />
                      </IconButton>
                    </PermissionGate>
                    <PermissionGate module={MODULES.EXPENSES} action={ACTIONS.DELETE}>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        aria-label="Delete fuel log"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setPendingDelete(log)}
                      >
                        <Trash2 className="size-4" />
                      </IconButton>
                    </PermissionGate>
                  </div>
                </TD>
              </TR>
            )
          })}
        </TBody>
      </TableContainer>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={submitting}
        tone="danger"
        title="Delete this fuel log?"
        description={`This will permanently remove the fuel log${pendingDelete ? ` for ${pendingDelete.id}` : ''}. This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </>
  )
}
