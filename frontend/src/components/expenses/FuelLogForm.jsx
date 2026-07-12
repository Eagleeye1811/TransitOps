import { useState } from 'react'
import { Field, Input, Select } from '@/components/common/FormControls'
import { Button } from '@/components/common/Button'

const EMPTY_VALUES = {
  vehicleId: '',
  date: '',
  quantityLitres: '',
  cost: '',
  odometerKm: '',
  station: '',
  receiptRef: '',
}

/** Shared create/edit form for fuel logs, used inside a Modal. `vehicles`
 * is fetched once by the parent page. */
const FUEL_PRICE_PER_LITRE = 102 // ₹/L, used to auto-suggest cost from quantity

export function FuelLogForm({ initialValues, onSubmit, onCancel, submitting = false, vehicles = [] }) {
  const [values, setValues] = useState({ ...EMPTY_VALUES, ...initialValues })
  const [errors, setErrors] = useState({})
  const [costTouched, setCostTouched] = useState(Boolean(initialValues?.cost))

  function update(patch) {
    setValues((v) => ({ ...v, ...patch }))
  }

  function updateQuantity(quantityLitres) {
    const patch = { quantityLitres }
    if (!costTouched && quantityLitres !== '') {
      patch.cost = String(Math.round(Number(quantityLitres) * FUEL_PRICE_PER_LITRE))
    }
    update(patch)
  }

  function updateCost(cost) {
    setCostTouched(true)
    update({ cost })
  }

  function validate() {
    const next = {}
    if (!values.vehicleId) next.vehicleId = 'Vehicle is required'
    if (!values.date) next.date = 'Date is required'
    if (values.quantityLitres === '' || Number(values.quantityLitres) <= 0) next.quantityLitres = 'Enter a valid quantity'
    if (values.cost === '' || Number(values.cost) < 0) next.cost = 'Enter a valid cost'
    if (values.odometerKm === '' || Number(values.odometerKm) < 0) next.odometerKm = 'Enter a valid odometer reading'
    if (!values.station?.trim()) next.station = 'Fuel station is required'
    if (!values.receiptRef?.trim()) next.receiptRef = 'Receipt reference is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      ...values,
      quantityLitres: Number(values.quantityLitres),
      cost: Number(values.cost),
      odometerKm: Number(values.odometerKm),
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Date" htmlFor="date" required error={errors.date}>
          <Input id="date" type="date" value={values.date} onChange={(e) => update({ date: e.target.value })} />
        </Field>
        <Field label="Quantity (Litres)" htmlFor="quantityLitres" required error={errors.quantityLitres}>
          <Input
            id="quantityLitres"
            type="number"
            min="0"
            step="0.01"
            value={values.quantityLitres}
            onChange={(e) => updateQuantity(e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Cost (₹)" htmlFor="cost" required error={errors.cost}>
          <Input id="cost" type="number" min="0" step="1" value={values.cost} onChange={(e) => updateCost(e.target.value)} />
        </Field>
        <Field label="Odometer Reading (km)" htmlFor="odometerKm" required error={errors.odometerKm}>
          <Input
            id="odometerKm"
            type="number"
            min="0"
            step="1"
            value={values.odometerKm}
            onChange={(e) => update({ odometerKm: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Fuel Station" htmlFor="station" required error={errors.station}>
        <Input id="station" value={values.station} onChange={(e) => update({ station: e.target.value })} placeholder="e.g. HP Petrol Pump, SG Highway" />
      </Field>

      <Field label="Receipt Reference" htmlFor="receiptRef" required error={errors.receiptRef}>
        <Input id="receiptRef" value={values.receiptRef} onChange={(e) => update({ receiptRef: e.target.value })} placeholder="e.g. RCPT-88231" />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initialValues ? 'Save Changes' : 'Log Fuel'}
        </Button>
      </div>
    </form>
  )
}
