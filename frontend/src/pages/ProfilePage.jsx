import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card'
import { Field, Input } from '@/components/common/FormControls'
import { Button } from '@/components/common/Button'
import { RoleBadge } from '@/components/layout/RoleBadge'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { initials, formatDateTime } from '@/utils/formatters'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ name: user?.name ?? '', phone: user?.phone ?? '', region: user?.region ?? '' })
  const [saving, setSaving] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      updateUser(form)
      setSaving(false)
      toast.success('Profile updated.')
    }, 300)
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardContent className="flex items-center gap-4">
          <span className={`flex size-16 items-center justify-center rounded-full ${user.avatarColor ?? 'bg-brand-600'} text-lg font-semibold text-white`}>
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <RoleBadge role={user.role} />
              <span className="text-xs text-slate-400">Last login {formatDateTime(user.lastLogin)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>Your role and permissions are managed by an administrator.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Full name" htmlFor="name">
              <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label="Phone number" htmlFor="phone">
              <Input id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </Field>
            <Field label="Region" htmlFor="region">
              <Input id="region" value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} />
            </Field>
            <Field label="Email" htmlFor="email" hint="Contact an administrator to change your email.">
              <Input id="email" value={user.email} disabled />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
