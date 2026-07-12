import { cn } from '@/utils/cn'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return <div className={cn('flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4', className)}>{children}</div>
}

export function CardTitle({ className, children }) {
  return <h3 className={cn('text-sm font-semibold text-slate-900', className)}>{children}</h3>
}

export function CardDescription({ className, children }) {
  return <p className={cn('mt-0.5 text-xs text-slate-500', className)}>{children}</p>
}

export function CardContent({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>
}

export function CardFooter({ className, children }) {
  return <div className={cn('border-t border-slate-100 px-5 py-3', className)}>{children}</div>
}
