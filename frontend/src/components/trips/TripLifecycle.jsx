import { Check, FileEdit, Send, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { TRIP_STATUS } from '@/data/trips'

const STEPS = [
  { key: TRIP_STATUS.DRAFT, label: 'Draft', icon: FileEdit },
  { key: TRIP_STATUS.DISPATCHED, label: 'Dispatched', icon: Send },
  { key: TRIP_STATUS.COMPLETED, label: 'Completed', icon: CheckCircle2 },
]

const STEP_ORDER = { [TRIP_STATUS.DRAFT]: 0, [TRIP_STATUS.DISPATCHED]: 1, [TRIP_STATUS.COMPLETED]: 2 }

/**
 * Horizontal stepper showing a trip's progress through
 * Draft -> Dispatched -> Completed, or a terminal Cancelled state.
 */
export function TripLifecycle({ status }) {
  const isCancelled = status === TRIP_STATUS.CANCELLED
  const currentIndex = isCancelled ? -1 : (STEP_ORDER[status] ?? 0)

  return (
    <div className="flex flex-wrap items-center gap-y-4">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const done = !isCancelled && i < currentIndex
        const active = !isCancelled && i === currentIndex

        return (
          <div key={step.key} className="flex min-w-[88px] flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex size-9 items-center justify-center rounded-full border-2 transition-colors',
                  done && 'border-emerald-500 bg-emerald-500 text-white',
                  active && 'border-brand-600 bg-brand-600 text-white',
                  !done && !active && 'border-slate-200 bg-white text-slate-300',
                  isCancelled && 'border-slate-200 bg-slate-50 text-slate-300'
                )}
              >
                {done ? <Check className="size-4" /> : <Icon className="size-4" />}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  active && 'text-brand-700',
                  done && 'text-emerald-700',
                  !done && !active && 'text-slate-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('mx-2 h-0.5 flex-1 rounded', done ? 'bg-emerald-500' : 'bg-slate-200')} />
            )}
          </div>
        )
      })}

      {isCancelled && (
        <div className="flex min-w-[88px] items-center">
          <div className="mx-2 h-0.5 w-6 rounded bg-red-200" />
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex size-9 items-center justify-center rounded-full border-2 border-red-500 bg-red-500 text-white">
              <XCircle className="size-4" />
            </div>
            <span className="text-xs font-medium whitespace-nowrap text-red-700">Cancelled</span>
          </div>
        </div>
      )}
    </div>
  )
}
