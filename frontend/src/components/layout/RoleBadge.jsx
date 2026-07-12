import { ROLE_LABELS, ROLE_BADGE_COLORS } from '@/config/roles'
import { cn } from '@/utils/cn'

export function RoleBadge({ role, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        ROLE_BADGE_COLORS[role],
        className
      )}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}
