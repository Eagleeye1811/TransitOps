import { useState } from 'react'
import { Field, Input, Select } from '@/components/common/FormControls'
import { Button } from '@/components/common/Button'
import { ROLE_LIST, ROLE_LABELS } from '@/config/roles'
import { REGIONS } from '@/data/regions'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'locked', label: 'Locked' },
]

const EMPTY_FORM = {
  name: '',
  email: '',
  role: ROLE_LIST[0],
  phone: '',
  region: REGIONS[0],
  status: 'active',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Add/Edit user form. When `isEdit` is true a Status select is shown and
 * `initialValues` (a full user record) is used to prefill the fields.
 */
export function UserForm({ initialValues, isEdit = false, submitting = false, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues })
  const [errors, setErrors] = useState({})

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e))
  }

  function validate() {
    const next = {}
    if (!form.name?.trim()) next.name = 'Name is required.'
    if (!form.email?.trim()) next.email = 'Email is required.'
    else if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email address.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ ...form, name: form.name.trim(), email: form.email.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Full name" htmlFor="user-name" required error={errors.name}>
        <Input
          id="user-name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Priya Nair"
        />
      </Field>

      <Field label="Email address" htmlFor="user-email" required error={errors.email}>
        <Input
          id="user-email"
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="name@transitops.in"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Role" htmlFor="user-role" required>
          <Select id="user-role" value={form.role} onChange={(e) => update('role', e.target.value)}>
            {ROLE_LIST.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Region" htmlFor="user-region">
          <Select id="user-region" value={form.region} onChange={(e) => update('region', e.target.value)}>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Phone number" htmlFor="user-phone">
        <Input
          id="user-phone"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="+91 90000 00000"
        />
      </Field>

      {isEdit && (
        <Field label="Status" htmlFor="user-status" hint="Controls whether this user can sign in.">
          <Select id="user-status" value={form.status} onChange={(e) => update('status', e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {isEdit ? 'Save changes' : 'Add user'}
        </Button>
      </div>
    </form>
  )
}
