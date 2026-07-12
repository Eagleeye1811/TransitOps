import { createPortal } from 'react-dom'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToastStore } from '@/context/toastStore'
import { cn } from '@/utils/cn'

const ICONS = { success: CheckCircle2, error: XCircle, info: Info, warning: AlertTriangle }
const CLASSES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 [&_svg]:text-emerald-500',
  error: 'border-red-200 bg-red-50 text-red-800 [&_svg]:text-red-500',
  info: 'border-blue-200 bg-blue-50 text-blue-800 [&_svg]:text-blue-500',
  warning: 'border-amber-200 bg-amber-50 text-amber-800 [&_svg]:text-amber-500',
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] ?? Info
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border px-4 py-3 shadow-lg animate-toast-in',
              CLASSES[toast.type] ?? CLASSES.info
            )}
          >
            <Icon className="mt-0.5 size-5 shrink-0" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-current/60 hover:text-current"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>,
    document.body
  )
}
