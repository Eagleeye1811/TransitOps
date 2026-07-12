import { Activity } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { timeAgo } from '@/utils/formatters'

export function RecentActivityList({ items, title = 'Recent Activity', limit = 6 }) {
  const visible = items.slice(0, limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {visible.length === 0 ? (
          <EmptyState icon={Activity} title="No recent activity" />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {visible.map((item) => (
              <li key={item.id} className="flex gap-3 px-5 py-3.5">
                <span className="mt-1 flex size-2 shrink-0 rounded-full bg-brand-500" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{item.actor}</span>{' '}
                    <span className="text-slate-500 dark:text-slate-400">({item.role})</span> {item.action}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{timeAgo(item.timestamp)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
