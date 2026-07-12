import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Truck, ShieldCheck, Eye, EyeOff, AlertCircle, Info } from 'lucide-react'
import { ROLE_LIST, ROLE_LABELS, ROLE_ACCESS_SUMMARY } from '@/config/roles'
import { login as loginRequest } from '@/services/authService'
import { DEMO_PASSWORD, USERS } from '@/data/users'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { validateLoginForm } from '@/utils/validators'
import { Button } from '@/components/common/Button'
import { Field, Input, Select, Checkbox } from '@/components/common/FormControls'

const DEMO_ACCOUNTS = ROLE_LIST.map((role) => {
  const user = USERS.find((u) => u.role === role)
  return { role, email: user.email, password: DEMO_PASSWORD, name: user.name }
})

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState({ email: '', password: '', role: '', rememberMe: true })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
    setFormError('')
  }

  function fillDemo(account) {
    setForm({ email: account.email, password: account.password, role: account.role, rememberMe: true })
    setErrors({})
    setFormError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { isValid, errors: validationErrors } = validateLoginForm(form)
    setErrors(validationErrors)
    if (!isValid) return

    setSubmitting(true)
    setFormError('')
    const result = await loginRequest(form)
    setSubmitting(false)

    if (!result.success) {
      setFormError(result.error)
      toast.error(result.error)
      return
    }

    login(result.user, result.token, form.rememberMe)
    toast.success(`Welcome back, ${result.user.name.split(' ')[0]}.`)
    const redirectTo = location.state?.from?.pathname ?? '/dashboard'
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Branding panel */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 px-10 py-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-80 rounded-full bg-brand-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-600">
              <Truck className="size-5.5" />
            </div>
            <span className="text-xl font-bold">TransitOps</span>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">Smart Transport Operations Platform</p>
        </div>

        <div className="relative space-y-6">
          <div>
            <h2 className="text-3xl font-bold leading-tight">One login,<br />five roles.</h2>
            <p className="mt-3 max-w-sm text-sm text-slate-300">
              Admin, Fleet Manager, Dispatcher, Safety Officer and Financial Analyst each get a
              tailored dashboard, sidebar and permission set from a single sign-in.
            </p>
          </div>
          <div className="space-y-2.5 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Access is scoped by role after login
            </p>
            <ul className="space-y-1.5 text-sm text-slate-200">
              {ROLE_LIST.map((role) => (
                <li key={role} className="flex gap-1.5">
                  <span className="font-semibold text-white">{ROLE_LABELS[role]}</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-slate-300">{ROLE_ACCESS_SUMMARY[role]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="relative text-xs text-slate-500">TransitOps &copy; 2026 &middot; RBAC-enabled prototype</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Truck className="size-5" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">TransitOps</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sign in to your account</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Enter your credentials to continue.</p>

          {formError && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <Field label="Email" htmlFor="email" required error={errors.email}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@transitops.in"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                error={!!errors.email}
              />
            </Field>

            <Field label="Password" htmlFor="password" required error={errors.password}>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  error={!!errors.password}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            <Field label="Role" htmlFor="role" required error={errors.role} hint="Selecting a role does not grant it — access is verified against your account.">
              <Select id="role" value={form.role} onChange={(e) => update('role', e.target.value)} error={!!errors.role}>
                <option value="">Select your role…</option>
                {ROLE_LIST.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="flex items-center justify-between">
              <Checkbox
                label="Remember me"
                checked={form.rememberMe}
                onChange={(e) => update('rememberMe', e.target.checked)}
              />
              <button
                type="button"
                onClick={() => toast.info('Password reset links are disabled in this prototype. Contact your administrator.')}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={submitting}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-2 rounded-lg bg-slate-100 px-3.5 py-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <span>
              Your session is verified against the role stored on your account — the role picked
              above is only a request, not a grant.
            </span>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Info className="size-3.5" />
              Demo accounts
            </p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => fillDemo(account)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-left text-xs transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-slate-600 dark:hover:border-brand-700 dark:hover:bg-brand-500/10"
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{ROLE_LABELS[account.role]}</p>
                  <p className="truncate text-slate-500 dark:text-slate-400">{account.email}</p>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              Password for every demo account: <code className="rounded bg-slate-100 px-1 py-0.5 font-mono dark:bg-slate-700 dark:text-slate-300">{DEMO_PASSWORD}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
