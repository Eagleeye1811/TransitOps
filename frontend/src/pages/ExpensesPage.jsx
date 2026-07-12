import { useEffect, useState } from 'react'
import { Plus, Fuel, Receipt } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Tabs } from '@/components/common/Tabs'
import { Modal } from '@/components/common/Modal'
import { TableSkeleton } from '@/components/common/Skeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ExpenseSummaryCards } from '@/components/expenses/ExpenseSummaryCards'
import { FuelLogTable } from '@/components/expenses/FuelLogTable'
import { FuelLogForm } from '@/components/expenses/FuelLogForm'
import { ExpenseTable } from '@/components/expenses/ExpenseTable'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { useToast } from '@/hooks/useToast'
import { MODULES, ACTIONS } from '@/config/permissions'
import * as expenseService from '@/services/expenseService'

const TABS = [
  { value: 'fuel', label: 'Fuel Logs', icon: Fuel },
  { value: 'expenses', label: 'Other Expenses', icon: Receipt },
]

export default function ExpensesPage() {
  const toast = useToast()

  const [activeTab, setActiveTab] = useState('fuel')
  const [loading, setLoading] = useState(true)
  const [fuelLogs, setFuelLogs] = useState([])
  const [expenses, setExpenses] = useState([])

  const [fuelModal, setFuelModal] = useState({ open: false, editing: null })
  const [expenseModal, setExpenseModal] = useState({ open: false, editing: null })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([expenseService.getFuelLogs(), expenseService.getExpenses()]).then(([logs, exp]) => {
      if (!cancelled) {
        setFuelLogs(logs)
        setExpenses(exp)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleFuelSubmit(payload) {
    setSubmitting(true)
    try {
      if (fuelModal.editing) {
        const updated = await expenseService.updateFuelLog(fuelModal.editing.id, payload)
        setFuelLogs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
        toast.success('Fuel log updated.')
      } else {
        const created = await expenseService.createFuelLog(payload)
        setFuelLogs((prev) => [created, ...prev])
        toast.success('Fuel log added.')
      }
      setFuelModal({ open: false, editing: null })
    } catch {
      toast.error('Could not save fuel log. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleFuelDelete(log) {
    await expenseService.deleteFuelLog(log.id)
    setFuelLogs((prev) => prev.filter((f) => f.id !== log.id))
    toast.success('Fuel log deleted.')
  }

  async function handleExpenseSubmit(payload) {
    setSubmitting(true)
    try {
      if (expenseModal.editing) {
        const updated = await expenseService.updateExpense(expenseModal.editing.id, payload)
        setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
        toast.success('Expense updated.')
      } else {
        const created = await expenseService.createExpense(payload)
        setExpenses((prev) => [created, ...prev])
        toast.success('Expense added.')
      }
      setExpenseModal({ open: false, editing: null })
    } catch {
      toast.error('Could not save expense. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleExpenseDelete(expense) {
    await expenseService.deleteExpense(expense.id)
    setExpenses((prev) => prev.filter((e) => e.id !== expense.id))
    toast.success('Expense deleted.')
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Fuel &amp; Expenses</h1>
        <p className="text-sm text-slate-500">Track fuel consumption, operating costs and other vehicle expenses.</p>
      </div>

      <ExpenseSummaryCards fuelLogs={fuelLogs} expenses={expenses} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        {activeTab === 'fuel' ? (
          <PermissionGate module={MODULES.EXPENSES} action={ACTIONS.CREATE}>
            <Button onClick={() => setFuelModal({ open: true, editing: null })}>
              <Plus className="size-4" />
              Log Fuel
            </Button>
          </PermissionGate>
        ) : (
          <PermissionGate module={MODULES.EXPENSES} action={ACTIONS.CREATE}>
            <Button onClick={() => setExpenseModal({ open: true, editing: null })}>
              <Plus className="size-4" />
              Add Expense
            </Button>
          </PermissionGate>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <TableSkeleton rows={6} cols={7} />
        </div>
      ) : activeTab === 'fuel' ? (
        <FuelLogTable
          logs={fuelLogs}
          onEdit={(log) => setFuelModal({ open: true, editing: log })}
          onDelete={handleFuelDelete}
        />
      ) : (
        <ExpenseTable
          expenses={expenses}
          onEdit={(expense) => setExpenseModal({ open: true, editing: expense })}
          onDelete={handleExpenseDelete}
        />
      )}

      <Modal
        open={fuelModal.open}
        onClose={() => setFuelModal({ open: false, editing: null })}
        title={fuelModal.editing ? 'Edit Fuel Log' : 'Log Fuel'}
        size="lg"
      >
        <FuelLogForm
          initialValues={fuelModal.editing}
          onSubmit={handleFuelSubmit}
          onCancel={() => setFuelModal({ open: false, editing: null })}
          submitting={submitting}
        />
      </Modal>

      <Modal
        open={expenseModal.open}
        onClose={() => setExpenseModal({ open: false, editing: null })}
        title={expenseModal.editing ? 'Edit Expense' : 'Add Expense'}
        size="lg"
      >
        <ExpenseForm
          initialValues={expenseModal.editing}
          onSubmit={handleExpenseSubmit}
          onCancel={() => setExpenseModal({ open: false, editing: null })}
          submitting={submitting}
        />
      </Modal>
    </div>
  )
}
