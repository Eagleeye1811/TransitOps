import { useRef, useState } from 'react'
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react'
import { NOTIFICATIONS } from '@/data/notifications'
import { timeAgo } from '@/utils/formatters'
import { useClickOutside } from '@/hooks/useClickOutside'
import { cn } from '@/utils/cn'

const ICONS = { success: CheckCircle2, info: Info, warning: AlertTriangle, error: XCircle }
const ICON_COLORS = {
  success: 'text-emerald-500',
  info: 'text-blue-500',
  warning: 'text-amber-500',
  error: 'text-red-500',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false), open)

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 animate-fade-in rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })))}
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => {
              const Icon = ICONS[n.type] ?? Info
              return (
                <div
                  key={n.id}
                  className={cn('flex gap-3 border-b border-slate-50 px-4 py-3 last:border-0', !n.read && 'bg-brand-50/40')}
                >
                  <Icon className={cn('mt-0.5 size-4 shrink-0', ICON_COLORS[n.type])} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{n.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
