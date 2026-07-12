import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/config/roles'

export default function UnauthorizedPage() {
  const { role } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-50 text-red-500">
        <ShieldAlert className="size-8" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-slate-900">Access Denied</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {role
          ? `Your role (${ROLE_LABELS[role] ?? role}) does not have permission to view this page.`
          : 'You do not have permission to view this page.'}
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={() => window.history.back()}>
          Go back
        </Button>
        <Link to="/dashboard">
          <Button>Return to dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
