import { cn } from '@/utils/cn'

export function Skeleton({ className }) {
  return <div className={cn('relative overflow-hidden rounded-md bg-slate-200/70 skeleton-shimmer dark:bg-slate-700/50', className)} />
}

export function TableSkeleton({ rows = 6, cols = 6 }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-700">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ className }) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800', className)}>
      <Skeleton className="mb-3 h-3 w-24" />
      <Skeleton className="h-7 w-16" />
    </div>
  )
}
