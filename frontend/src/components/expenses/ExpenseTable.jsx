import { useState } from 'react'
import { Pencil, Trash2, Receipt } from 'lucide-react'
import { TableContainer, THead, TBody, TR, TH, TD } from '@/components/common/Table'
import { IconButton } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { PermissionGate } from '@/components/common/PermissionGate'
import { MODULES, ACTIONS } from '@/config/permissions'
import { formatCurrency, formatDate } from '@/utils/formatters'

const CATEGORY_COLORS = {
  Toll: 'blue',
  Parking: 'teal',
  Repair: 'amber',
  Tyre: 'violet',
  Maintenance: 'amber',
  Permit: 'gray',
  Insurance: 'green',
  Miscellaneous: 'gray',
}

/** Other-expenses table with gated edit/delete row actions. `vehicles` is a
 * Map keyed by id, fetched once by the parent page. */
export function ExpenseTable({ expenses, vehicles = new Map(), onEdit, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!expenses.length) {
    return (
      <EmptyState
        icon={Receipt}
        title="No expenses found"
        description="Try adjusting your filters, or add a new expense."
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
            <TH>Related Trip</TH>
            <TH>Category</TH>
            <TH className="text-right">Amount</TH>
            <TH>Date</TH>
            <TH>Description</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {expenses.map((expense) => {
            const vehicle = vehicles.get(expense.vehicleId)
            return (
              <TR key={expense.id}>
                <TD>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{vehicle?.registration ?? expense.vehicleId}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{vehicle?.model ?? '—'}</div>
                </TD>
                <TD>{expense.tripId ?? '—'}</TD>
                <TD>
                  <Badge color={CATEGORY_COLORS[expense.category] ?? 'gray'}>{expense.category}</Badge>
                </TD>
                <TD className="text-right font-medium text-slate-900 dark:text-slate-100">{formatCurrency(expense.amount)}</TD>
                <TD>{formatDate(expense.date)}</TD>
                <TD className="max-w-xs truncate">{expense.description}</TD>
                <TD className="text-right">
                  <div className="flex justify-end gap-1">
                    <PermissionGate module={MODULES.EXPENSES} action={ACTIONS.EDIT}>
                      <IconButton size="sm" variant="ghost" aria-label="Edit expense" onClick={() => onEdit?.(expense)}>
                        <Pencil className="size-4" />
                      </IconButton>
                    </PermissionGate>
                    <PermissionGate module={MODULES.EXPENSES} action={ACTIONS.DELETE}>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        aria-label="Delete expense"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setPendingDelete(expense)}
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
        title="Delete this expense?"
        description={`This will permanently remove the expense${pendingDelete ? ` ${pendingDelete.id}` : ''}. This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </>
  )
}
