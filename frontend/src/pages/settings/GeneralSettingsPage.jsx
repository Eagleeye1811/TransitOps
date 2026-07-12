import { useEffect, useState } from 'react'
import { Settings as SettingsIcon, Mail } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/common/Card'
import { Field, Input, Select, Checkbox } from '@/components/common/FormControls'
import { Button } from '@/components/common/Button'
import { CardSkeleton } from '@/components/common/Skeleton'
import { REGIONS } from '@/data/regions'
import { getOrgSettings, updateOrgSettings, runReminderSweep } from '@/services/settingsService'
import { useToast } from '@/hooks/useToast'

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'Indian Rupee (INR)' },
  { value: 'USD', label: 'US Dollar (USD)' },
]

const DISTANCE_UNIT_OPTIONS = ['Kilometers', 'Miles']
const WEIGHT_UNIT_OPTIONS = ['Kilograms', 'Pounds']

export default function GeneralSettingsPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(null)
  const [sweeping, setSweeping] = useState(false)
  const [sweepResult, setSweepResult] = useState(null)

  useEffect(() => {
    let active = true
    getOrgSettings().then((data) => {
      if (!active) return
      setForm(data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function updateNotification(field, value) {
    setForm((f) => ({ ...f, notifications: { ...f.notifications, [field]: value } }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateOrgSettings(form)
      setForm(updated)
      toast.success('Settings saved successfully.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRunSweep() {
    setSweeping(true)
    setSweepResult(null)
    try {
      const result = await runReminderSweep()
      setSweepResult(result)
      toast.success(result.sent ? `Reminder emails sent to ${result.recipients.length} recipient(s).` : result.reason)
    } catch {
      toast.error('Could not run the reminder sweep. Please try again.')
    } finally {
      setSweeping(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <SettingsIcon className="size-4.5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">General Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Organisation-wide preferences and defaults.</p>
        </div>
      </div>

      {loading || !form ? (
        <div className="space-y-6">
          <CardSkeleton className="h-64" />
          <CardSkeleton className="h-48" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Organisation details</CardTitle>
                <CardDescription>Basic information used across the app.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Organisation name" htmlFor="org-name" required>
                <Input
                  id="org-name"
                  value={form.organisationName}
                  onChange={(e) => update('organisationName', e.target.value)}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Default region" htmlFor="org-region">
                  <Select
                    id="org-region"
                    value={form.defaultRegion}
                    onChange={(e) => update('defaultRegion', e.target.value)}
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Currency" htmlFor="org-currency">
                  <Select id="org-currency" value={form.currency} onChange={(e) => update('currency', e.target.value)}>
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Distance unit" htmlFor="org-distance">
                  <Select
                    id="org-distance"
                    value={form.distanceUnit}
                    onChange={(e) => update('distanceUnit', e.target.value)}
                  >
                    {DISTANCE_UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Weight unit" htmlFor="org-weight">
                  <Select
                    id="org-weight"
                    value={form.weightUnit}
                    onChange={(e) => update('weightUnit', e.target.value)}
                  >
                    {WEIGHT_UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Notification preferences</CardTitle>
                <CardDescription>Choose how the system should notify your team.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Checkbox
                label="Email notifications"
                checked={form.notifications.email}
                onChange={(e) => updateNotification('email', e.target.checked)}
              />
              <Checkbox
                label="SMS notifications"
                checked={form.notifications.sms}
                onChange={(e) => updateNotification('sms', e.target.checked)}
              />
              <Checkbox
                label="Licence expiry alerts"
                checked={form.notifications.licenceExpiryAlerts}
                onChange={(e) => updateNotification('licenceExpiryAlerts', e.target.checked)}
              />
              <Checkbox
                label="Maintenance alerts"
                checked={form.notifications.maintenanceAlerts}
                onChange={(e) => updateNotification('maintenanceAlerts', e.target.checked)}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {!loading && form && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Licence expiry reminder sweep</CardTitle>
              <CardDescription>
                Runs automatically every day at 08:00 IST. Trigger it manually here to see it fire immediately.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Emails every active Admin/Safety Officer a summary of driver licences and documents expiring within the
              next {form.licenceExpiryReminderDays ?? 60} days.
            </p>
            {sweepResult && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm dark:border-slate-700 dark:bg-slate-800">
                {sweepResult.sent ? (
                  <>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      Sent to {sweepResult.recipients.join(', ')}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {sweepResult.expiringDriverCount} driver licence(s), {sweepResult.expiringDocumentCount} document(s)
                      flagged.
                    </p>
                  </>
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">{sweepResult.reason}</p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="button" variant="secondary" onClick={handleRunSweep} loading={sweeping}>
              <Mail className="size-4" />
              Send reminder emails now
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
