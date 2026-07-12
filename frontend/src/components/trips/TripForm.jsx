import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Field, Input, Select } from '@/components/common/FormControls'
import { Button } from '@/components/common/Button'
import { REGIONS } from '@/data/regions'
import { VEHICLE_STATUS } from '@/data/vehicles'
import { DRIVER_STATUS } from '@/data/drivers'
import * as fleetService from '@/services/fleetService'
import * as driverService from '@/services/driverService'
import * as tripService from '@/services/tripService'

const EMPTY_FORM = {
  source: '',
  destination: '',
  vehicleId: '',
  driverId: '',
  cargoWeightKg: '',
  plannedDistanceKm: '',
  region: '',
  scheduledDate: '',
  scheduledTime: '',
}

function toFormState(initialValues) {
  return {
    ...EMPTY_FORM,
    ...initialValues,
    vehicleId: initialValues?.vehicleId ?? '',
    driverId: initialValues?.driverId ?? '',
    cargoWeightKg: initialValues?.cargoWeightKg ?? '',
    plannedDistanceKm: initialValues?.plannedDistanceKm ?? '',
  }
}

/**
 * Create/edit form for a draft trip. Saving a draft is always allowed —
 * assignment validation (capacity/availability) is surfaced inline as a
 * non-blocking warning; it only ever blocks the *dispatch* action, which
 * happens from the trip details page, not from here.
 */
export function TripForm({ initialValues, tripId = null, onSubmit, submitting = false, submitLabel = 'Save Trip' }) {
  const [form, setForm] = useState(() => toFormState(initialValues))
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [assignmentErrors, setAssignmentErrors] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let active = true
    Promise.all([fleetService.getVehicles(), driverService.getDrivers()]).then(([v, d]) => {
      if (!active) return
      setVehicles(v)
      setDrivers(d)
      setLoadingOptions(false)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    tripService
      .validateAssignment({
        vehicleId: form.vehicleId || null,
        driverId: form.driverId || null,
        cargoWeightKg: form.cargoWeightKg ? Number(form.cargoWeightKg) : null,
        excludeTripId: tripId,
      })
      .then((result) => {
        if (active) setAssignmentErrors(result.errors)
      })
    return () => {
      active = false
    }
  }, [form.vehicleId, form.driverId, form.cargoWeightKg, tripId])

  const availableVehicles = vehicles.filter(
    (v) => v.status === VEHICLE_STATUS.AVAILABLE || v.id === initialValues?.vehicleId
  )
  const availableDrivers = drivers.filter(
    (d) => d.status === DRIVER_STATUS.AVAILABLE || d.id === initialValues?.driverId
  )

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.source.trim()) e.source = 'Source is required.'
    if (!form.destination.trim()) e.destination = 'Destination is required.'
    if (!form.region) e.region = 'Region is required.'
    if (!form.scheduledDate) e.scheduledDate = 'Scheduled date is required.'
    if (!form.scheduledTime) e.scheduledTime = 'Scheduled time is required.'
    if (!form.cargoWeightKg || Number(form.cargoWeightKg) <= 0) e.cargoWeightKg = 'Enter a valid cargo weight.'
    if (!form.plannedDistanceKm || Number(form.plannedDistanceKm) <= 0)
      e.plannedDistanceKm = 'Enter a valid planned distance.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      source: form.source.trim(),
      destination: form.destination.trim(),
      vehicleId: form.vehicleId || null,
      driverId: form.driverId || null,
      cargoWeightKg: Number(form.cargoWeightKg),
      plannedDistanceKm: Number(form.plannedDistanceKm),
      region: form.region,
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Source" htmlFor="source" required error={errors.source}>
          <Input
            id="source"
            value={form.source}
            onChange={(e) => update('source', e.target.value)}
            placeholder="e.g. Gandhinagar Depot"
          />
        </Field>
        <Field label="Destination" htmlFor="destination" required error={errors.destination}>
          <Input
            id="destination"
            value={form.destination}
            onChange={(e) => update('destination', e.target.value)}
            placeholder="e.g. Ahmedabad Hub"
          />
        </Field>

        <Field label="Vehicle" htmlFor="vehicleId" hint="Only available vehicles are shown.">
          <Select
            id="vehicleId"
            value={form.vehicleId}
            onChange={(e) => update('vehicleId', e.target.value)}
            disabled={loadingOptions}
          >
            <option value="">Unassigned</option>
            {availableVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registration} — {v.model} ({v.capacityKg} kg)
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Driver" htmlFor="driverId" hint="Only available drivers are shown.">
          <Select
            id="driverId"
            value={form.driverId}
            onChange={(e) => update('driverId', e.target.value)}
            disabled={loadingOptions}
          >
            <option value="">Unassigned</option>
            {availableDrivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.licenceCategory})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Cargo weight (kg)" htmlFor="cargoWeightKg" required error={errors.cargoWeightKg}>
          <Input
            id="cargoWeightKg"
            type="number"
            min="0"
            value={form.cargoWeightKg}
            onChange={(e) => update('cargoWeightKg', e.target.value)}
          />
        </Field>
        <Field label="Planned distance (km)" htmlFor="plannedDistanceKm" required error={errors.plannedDistanceKm}>
          <Input
            id="plannedDistanceKm"
            type="number"
            min="0"
            value={form.plannedDistanceKm}
            onChange={(e) => update('plannedDistanceKm', e.target.value)}
          />
        </Field>

        <Field label="Region" htmlFor="region" required error={errors.region}>
          <Select id="region" value={form.region} onChange={(e) => update('region', e.target.value)}>
            <option value="">Select region</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Scheduled date" htmlFor="scheduledDate" required error={errors.scheduledDate}>
            <Input
              id="scheduledDate"
              type="date"
              value={form.scheduledDate}
              onChange={(e) => update('scheduledDate', e.target.value)}
            />
          </Field>
          <Field label="Scheduled time" htmlFor="scheduledTime" required error={errors.scheduledTime}>
            <Input
              id="scheduledTime"
              type="time"
              value={form.scheduledTime}
              onChange={(e) => update('scheduledTime', e.target.value)}
            />
          </Field>
        </div>
      </div>

      {assignmentErrors.length > 0 && (
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Assignment issues — dispatch will be blocked until resolved:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {assignmentErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
