import { cn } from '@/utils/cn'

export function Badge({ className, color = 'gray', children, dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        COLOR_CLASSES[color] ?? COLOR_CLASSES.gray,
        className
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', DOT_CLASSES[color] ?? DOT_CLASSES.gray)} />}
      {children}
    </span>
  )
}

const COLOR_CLASSES = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30',
  red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30',
  gray: 'bg-gray-100 text-gray-600 ring-gray-400/20 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-500/30',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/30',
  teal: 'bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-500/10 dark:text-teal-400 dark:ring-teal-500/30',
}

const DOT_CLASSES = {
  green: 'bg-emerald-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
  violet: 'bg-violet-500',
  teal: 'bg-teal-500',
}

// Consistent status -> colour mapping used across the whole product:
// green = available/active/completed, blue = info/dispatched,
// amber = warning/expiring, red = suspended/cancelled/expired,
// gray = retired/inactive.
const STATUS_COLOR = {
  available: 'green',
  active: 'green',
  completed: 'green',
  on_duty: 'green',
  resolved: 'green',
  action_taken: 'green',

  on_trip: 'blue',
  dispatched: 'blue',
  info: 'blue',
  under_review: 'blue',

  in_shop: 'amber',
  scheduled: 'amber',
  warning: 'amber',
  expiring: 'amber',
  off_duty: 'amber',
  pending: 'amber',
  locked: 'amber',
  open: 'amber',

  suspended: 'red',
  cancelled: 'red',
  expired: 'red',
  error: 'red',
  high: 'red',

  retired: 'gray',
  inactive: 'gray',
  draft: 'gray',
  medium: 'amber',
  low: 'gray',
  closed: 'gray',
}

export function StatusBadge({ status, label, dot = true, className }) {
  const color = STATUS_COLOR[status] ?? 'gray'
  return (
    <Badge color={color} dot={dot} className={className}>
      {label ?? status}
    </Badge>
  )
}

export function AccessBadge({ accessLevel, label, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        className
      )}
    >
      {label ?? accessLevel}
    </span>
  )
}
