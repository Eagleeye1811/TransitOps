import { useState } from 'react'
import { Field, Input, Select, Textarea } from '@/components/common/FormControls'
import { Button } from '@/components/common/Button'
import { SERVICE_TYPES, MAINTENANCE_STATUS, MAINTENANCE_STATUS_LABELS } from '@/data/maintenance'
import { VEHICLES } from '@/data/vehicles'

const EMPTY_VALUES = {
  vehicleId: '',
  serviceType: '',
  description: '',
  cost: '',
  serviceDate: '',
  expectedCompletionDate: '',
  status: MAINTENANCE_STATUS.SCHEDULED,
}

/**
 * Shared create/edit form for maintenance records. Status field is only
 * rendered in edit mode — new records always default to Scheduled.
 */
export function MaintenanceForm({ initialValues, mode = 'create', onSubmit, onCancel, submitting = false }) {
  const [values, setValues] = useState({ ...EMPTY_VALUES, ...initialValues })
  const [errors, setErrors] = useState({})

  function update(patch) {
    setValues((v) => ({ ...v, ...patch }))
  }

  function validate() {
    const next = {}
    if (!values.vehicleId) next.vehicleId = 'Vehicle is required'
    if (!values.serviceType) next.serviceType = 'Service type is required'
    if (!values.description?.trim()) next.description = 'Description is required'
    if (values.cost === '' || values.cost === null || Number(values.cost) < 0) next.cost = 'Enter a valid cost'
    if (!values.serviceDate) next.serviceDate = 'Service date is required'
    if (!values.expectedCompletionDate) next.expectedCompletionDate = 'Expected completion date is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    const payload = {
      ...values,
      cost: Number(values.cost),
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Vehicle" htmlFor="vehicleId" required error={errors.vehicleId}>
        <Select id="vehicleId" value={values.vehicleId} onChange={(e) => update({ vehicleId: e.target.value })}>
          <option value="">Select vehicle…</option>
          {VEHICLES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registration} — {v.model}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Service Type" htmlFor="serviceType" required error={errors.serviceType}>
        <Select id="serviceType" value={values.serviceType} onChange={(e) => update({ serviceType: e.target.value })}>
          <option value="">Select service type…</option>
          {SERVICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Description" htmlFor="description" required error={errors.description}>
        <Textarea
          id="description"
          rows={3}
          value={values.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Describe the service performed or required…"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Cost (₹)" htmlFor="cost" required error={errors.cost}>
          <Input
            id="cost"
            type="number"
            min="0"
            step="1"
            value={values.cost}
            onChange={(e) => update({ cost: e.target.value })}
            placeholder="0"
          />
        </Field>

        {mode === 'edit' && (
          <Field label="Status" htmlFor="status">
            <Select id="status" value={values.status} onChange={(e) => update({ status: e.target.value })}>
              {Object.values(MAINTENANCE_STATUS).map((status) => (
                <option key={status} value={status}>
                  {MAINTENANCE_STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Service Date" htmlFor="serviceDate" required error={errors.serviceDate}>
          <Input
            id="serviceDate"
            type="date"
            value={values.serviceDate}
            onChange={(e) => update({ serviceDate: e.target.value })}
          />
        </Field>

        <Field label="Expected Completion Date" htmlFor="expectedCompletionDate" required error={errors.expectedCompletionDate}>
          <Input
            id="expectedCompletionDate"
            type="date"
            value={values.expectedCompletionDate}
            onChange={(e) => update({ expectedCompletionDate: e.target.value })}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {mode === 'edit' ? 'Save Changes' : 'Add Maintenance'}
        </Button>
      </div>
    </form>
  )
}
