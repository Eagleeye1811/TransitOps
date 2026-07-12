import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

export function Field({ label, htmlFor, required, error, hint, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="size-3.5" />
          {error}
        </p>
      )}
    </div>
  )
}

const controlBase =
  'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500'

export const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(controlBase, error ? 'border-red-300 focus:border-red-400 dark:border-red-800' : 'border-slate-300 focus:border-brand-500 dark:border-slate-600', className)}
      {...props}
    />
  )
})

export const Textarea = forwardRef(function Textarea({ className, error, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(controlBase, error ? 'border-red-300 focus:border-red-400 dark:border-red-800' : 'border-slate-300 focus:border-brand-500 dark:border-slate-600', className)}
      {...props}
    />
  )
})

export const Select = forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        controlBase,
        'pr-8 appearance-none bg-[url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%2394a3b8"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>\')] bg-[length:1.1rem] bg-[right_0.5rem_center] bg-no-repeat',
        error ? 'border-red-300 focus:border-red-400 dark:border-red-800' : 'border-slate-300 focus:border-brand-500 dark:border-slate-600',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
})

export function Checkbox({ className, label, ...props }) {
  return (
    <label className={cn('inline-flex select-none items-center gap-2 text-sm text-slate-700 dark:text-slate-300', className)}>
      <input
        type="checkbox"
        className="size-4 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-800"
        {...props}
      />
      {label}
    </label>
  )
}
