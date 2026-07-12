import { useState } from 'react'
import { Field, Input, Select, Textarea } from '@/components/common/FormControls'
import { Button } from '@/components/common/Button'
import { EXPENSE_CATEGORIES } from '@/data/fuelLogs'

const EMPTY_VALUES = {
  vehicleId: '',
  tripId: '',
  category: '',
  amount: '',
  date: '',
  description: '',
}

/** Shared create/edit form for other expenses, used inside a Modal.
 * `vehicles`/`trips` are fetched once by the parent page (Financial
 * Analyst has no Trips module access, so `trips` may come back empty). */
export function ExpenseForm({ initialValues, onSubmit, onCancel, submitting = false, vehicles = [], trips = [] }) {
  const [values, setValues] = useState({ ...EMPTY_VALUES, ...initialValues, tripId: initialValues?.tripId ?? '' })
  const [errors, setErrors] = useState({})

  function update(patch) {
    setValues((v) => ({ ...v, ...patch }))
  }

  function validate() {
    const next = {}
    if (!values.vehicleId) next.vehicleId = 'Vehicle is required'
    if (!values.category) next.category = 'Category is required'
    if (values.amount === '' || Number(values.amount) <= 0) next.amount = 'Enter a valid amount'
    if (!values.date) next.date = 'Date is required'
    if (!values.description?.trim()) next.description = 'Description is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      ...values,
      tripId: values.tripId || null,
      amount: Number(values.amount),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Vehicle" htmlFor="vehicleId" required error={errors.vehicleId}>
        <Select id="vehicleId" value={values.vehicleId} onChange={(e) => update({ vehicleId: e.target.value })}>
          <option value="">Select vehicle…</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registration} — {v.model}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Related Trip" htmlFor="tripId" hint="Optional — link this expense to a specific trip">
        <Select id="tripId" value={values.tripId} onChange={(e) => update({ tripId: e.target.value })}>
          <option value="">No related trip</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.id} — {t.source} → {t.destination}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Category" htmlFor="category" required error={errors.category}>
          <Select id="category" value={values.category} onChange={(e) => update({ category: e.target.value })}>
            <option value="">Select category…</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Amount (₹)" htmlFor="amount" required error={errors.amount}>
          <Input id="amount" type="number" min="0" step="1" value={values.amount} onChange={(e) => update({ amount: e.target.value })} />
        </Field>
      </div>

      <Field label="Date" htmlFor="date" required error={errors.date}>
        <Input id="date" type="date" value={values.date} onChange={(e) => update({ date: e.target.value })} />
      </Field>

      <Field label="Description" htmlFor="description" required error={errors.description}>
        <Textarea
          id="description"
          rows={3}
          value={values.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Describe this expense…"
        />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initialValues ? 'Save Changes' : 'Add Expense'}
        </Button>
      </div>
    </form>
  )
}
