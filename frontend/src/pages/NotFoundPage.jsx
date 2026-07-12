import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/common/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Compass className="size-8" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-slate-900">404 — Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button>Return to dashboard</Button>
      </Link>
    </div>
  )
}
