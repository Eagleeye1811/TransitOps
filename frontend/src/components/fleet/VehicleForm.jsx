import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { Field, Input, Select } from '@/components/common/FormControls'
import { Button } from '@/components/common/Button'
import { VEHICLE_STATUS, VEHICLE_STATUS_LABELS } from '@/data/vehicles'
import { REGIONS, VEHICLE_TYPES } from '@/data/regions'
import { isRegistrationTaken } from '@/services/fleetService'
import { mockVinDecode } from '@/utils/mockVinDecode'
import { useToast } from '@/hooks/useToast'

const EMPTY_FORM = {
  registration: '',
  model: '',
  type: VEHICLE_TYPES[0],
  capacityKg: '',
  region: REGIONS[0],
  acquisitionCost: '',
  odometerKm: '',
  status: VEHICLE_STATUS.AVAILABLE,
}

/**
 * Shared Add/Edit vehicle form.
 * - `isEdit` toggles the status select (only editable when editing an existing vehicle).
 * - `vehicleId` is used to exclude the current vehicle from the registration-uniqueness check.
 */
export function VehicleForm({ initialValues, isEdit = false, vehicleId = null, submitting = false, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, ...initialValues }))
  const [errors, setErrors] = useState({})
  const [decoding, setDecoding] = useState(false)
  const toast = useToast()

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }))
  }

  async function handleDecode() {
    const registration = form.registration?.trim()
    if (!registration || decoding) return

    setDecoding(true)
    try {
      const decoded = await mockVinDecode(registration)
      update({ model: decoded.model, type: decoded.type, capacityKg: decoded.capacityKg })
      toast.success('Vehicle details pre-filled from registration lookup.')
    } finally {
      setDecoding(false)
    }
  }

  function validate() {
    const next = {}

    const registration = form.registration?.trim() ?? ''
    if (!registration) {
      next.registration = 'Registration number is required.'
    } else if (isRegistrationTaken(registration, vehicleId)) {
      next.registration = 'This registration number is already in use.'
    }

    if (!form.model?.trim()) next.model = 'Model is required.'
    if (!form.type) next.type = 'Vehicle type is required.'
    if (!form.region) next.region = 'Region is required.'

    const capacity = Number(form.capacityKg)
    if (form.capacityKg === '' || Number.isNaN(capacity) || capacity <= 0) {
      next.capacityKg = 'Capacity must be greater than 0.'
    }

    const cost = Number(form.acquisitionCost)
    if (form.acquisitionCost === '' || Number.isNaN(cost) || cost < 0) {
      next.acquisitionCost = 'Acquisition cost must be 0 or greater.'
    }

    if (form.odometerKm !== '') {
      const odometer = Number(form.odometerKm)
      if (Number.isNaN(odometer) || odometer < 0) {
        next.odometerKm = 'Odometer reading cannot be negative.'
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      registration: form.registration.trim().toUpperCase(),
      model: form.model.trim(),
      type: form.type,
      capacityKg: Number(form.capacityKg),
      region: form.region,
      acquisitionCost: Number(form.acquisitionCost),
      odometerKm: form.odometerKm === '' ? 0 : Number(form.odometerKm),
    }
    if (isEdit) payload.status = form.status

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Registration number" htmlFor="registration" required error={errors.registration}>
          <div className="flex gap-2">
            <Input
              id="registration"
              value={form.registration}
              onChange={(e) => update({ registration: e.target.value })}
              placeholder="e.g. GJ01AB4521"
              error={!!errors.registration}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={!form.registration?.trim() || decoding}
              onClick={handleDecode}
              className="shrink-0 whitespace-nowrap"
            >
              {decoding ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Decode from Registration
            </Button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Demo lookup — not a live registry integration.</p>
        </Field>

        <Field label="Model" htmlFor="model" required error={errors.model}>
          <Input
            id="model"
            value={form.model}
            onChange={(e) => update({ model: e.target.value })}
            placeholder="e.g. Tata Ace Gold VAN-05"
            error={!!errors.model}
          />
        </Field>

        <Field label="Vehicle type" htmlFor="type" required error={errors.type}>
          <Select id="type" value={form.type} onChange={(e) => update({ type: e.target.value })} error={!!errors.type}>
            {VEHICLE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Region" htmlFor="region" required error={errors.region}>
          <Select id="region" value={form.region} onChange={(e) => update({ region: e.target.value })} error={!!errors.region}>
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Capacity (kg)" htmlFor="capacityKg" required error={errors.capacityKg}>
          <Input
            id="capacityKg"
            type="number"
            min="0"
            value={form.capacityKg}
            onChange={(e) => update({ capacityKg: e.target.value })}
            error={!!errors.capacityKg}
          />
        </Field>

        <Field label="Odometer (km)" htmlFor="odometerKm" error={errors.odometerKm} hint={!errors.odometerKm ? 'Leave blank for a brand-new vehicle.' : undefined}>
          <Input
            id="odometerKm"
            type="number"
            min="0"
            value={form.odometerKm}
            onChange={(e) => update({ odometerKm: e.target.value })}
            error={!!errors.odometerKm}
          />
        </Field>

        <Field label="Acquisition cost (₹)" htmlFor="acquisitionCost" required error={errors.acquisitionCost}>
          <Input
            id="acquisitionCost"
            type="number"
            min="0"
            value={form.acquisitionCost}
            onChange={(e) => update({ acquisitionCost: e.target.value })}
            error={!!errors.acquisitionCost}
          />
        </Field>

        {isEdit && (
          <Field label="Status" htmlFor="status" required>
            <Select id="status" value={form.status} onChange={(e) => update({ status: e.target.value })}>
              {Object.values(VEHICLE_STATUS).map((status) => (
                <option key={status} value={status}>
                  {VEHICLE_STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {isEdit ? 'Save changes' : 'Add vehicle'}
        </Button>
      </div>
    </form>
  )
}
