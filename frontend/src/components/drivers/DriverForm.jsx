import { useState } from 'react'
import { Field, Input, Select } from '@/components/common/FormControls'
import { Button } from '@/components/common/Button'
import { LICENCE_CATEGORIES } from '@/data/drivers'
import { REGIONS } from '@/data/regions'

// Indian DL format: 2-letter state code + dash + 13 digits (2-digit RTO code
// + 4-digit year of issue + 7-digit unique number), e.g. MH-1420110012345.
const LICENCE_NUMBER_PATTERN = /^[A-Z]{2}-\d{13}$/i

const EMPTY_VALUES = {
  name: '',
  licenceNumber: '',
  licenceCategory: LICENCE_CATEGORIES[0],
  licenceExpiry: '',
  contact: '',
  region: REGIONS[0],
  safetyScore: 100,
}

/**
 * Shared Add/Edit driver form.
 *
 * mode="full" (admin, safety officer) — every field editable.
 * mode="operational" (fleet manager) — only the contact field is editable;
 * everything else renders disabled/read-only so the field is visible but
 * cannot be changed, per RBAC rules (Fleet Manager may never touch
 * licence/safety-score/status data).
 */
export function DriverForm({ initialValues, onSubmit, submitting = false, mode = 'full', submitLabel = 'Save Driver', onCancel }) {
  const [values, setValues] = useState({ ...EMPTY_VALUES, ...initialValues })
  const [errors, setErrors] = useState({})
  const readOnly = mode === 'operational'

  const setField = (key) => (e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))

  function validate() {
    const nextErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Full name is required'
    if (!values.contact.trim()) nextErrors.contact = 'Contact number is required'
    if (!readOnly) {
      if (!values.licenceNumber.trim()) {
        nextErrors.licenceNumber = 'Licence number is required'
      } else if (!LICENCE_NUMBER_PATTERN.test(values.licenceNumber.trim())) {
        nextErrors.licenceNumber = 'Enter a valid licence number in the format MH-1420110012345 (state code + 13 digits)'
      }
      if (!values.licenceExpiry) nextErrors.licenceExpiry = 'Licence expiry date is required'
      if (values.safetyScore !== '' && (Number(values.safetyScore) < 0 || Number(values.safetyScore) > 100)) {
        nextErrors.safetyScore = 'Safety score must be between 0 and 100'
      }
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    if (readOnly) {
      onSubmit({ contact: values.contact })
      return
    }

    onSubmit({
      ...values,
      safetyScore: Number(values.safetyScore),
    })
  }

  const lockedHint = readOnly ? 'Only Admin / Safety Officer can edit this field' : undefined

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Full Name" htmlFor="name" required error={errors.name} hint={lockedHint}>
          <Input id="name" value={values.name} onChange={setField('name')} disabled={readOnly} placeholder="e.g. Alex Pinto" />
        </Field>

        <Field label="Contact Number" htmlFor="contact" required error={errors.contact}>
          <Input id="contact" value={values.contact} onChange={setField('contact')} placeholder="+91 98765 xxxxx" />
        </Field>

        <Field label="Licence Number" htmlFor="licenceNumber" required={!readOnly} error={errors.licenceNumber} hint={lockedHint}>
          <Input id="licenceNumber" value={values.licenceNumber} onChange={setField('licenceNumber')} disabled={readOnly} placeholder="MH-1420110012345" />
        </Field>

        <Field label="Licence Category" htmlFor="licenceCategory" required hint={lockedHint}>
          <Select id="licenceCategory" value={values.licenceCategory} onChange={setField('licenceCategory')} disabled={readOnly}>
            {LICENCE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Licence Expiry" htmlFor="licenceExpiry" required={!readOnly} error={errors.licenceExpiry} hint={lockedHint}>
          <Input id="licenceExpiry" type="date" value={values.licenceExpiry} onChange={setField('licenceExpiry')} disabled={readOnly} />
        </Field>

        <Field label="Region" htmlFor="region" required hint={lockedHint}>
          <Select id="region" value={values.region} onChange={setField('region')} disabled={readOnly}>
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Safety Score (0–100)" htmlFor="safetyScore" error={errors.safetyScore} hint={lockedHint}>
          <Input id="safetyScore" type="number" min={0} max={100} value={values.safetyScore} onChange={setField('safetyScore')} disabled={readOnly} />
        </Field>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
