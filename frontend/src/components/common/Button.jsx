import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const VARIANTS = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600 shadow-sm disabled:bg-brand-300',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:outline-brand-600 shadow-sm disabled:text-slate-400',
  outline:
    'bg-transparent text-brand-700 border border-brand-200 hover:bg-brand-50 focus-visible:outline-brand-600',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:outline-brand-600',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 shadow-sm disabled:bg-red-300',
  dangerOutline:
    'bg-white text-red-600 border border-red-200 hover:bg-red-50 focus-visible:outline-red-600',
}

const SIZES = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-md',
  md: 'px-3.5 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-5 py-2.5 text-sm gap-2 rounded-lg',
}

export const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', loading = false, disabled, children, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
})

export const IconButton = forwardRef(function IconButton(
  { className, variant = 'ghost', size = 'md', children, ...props },
  ref
) {
  const iconSizes = { sm: 'p-1.5', md: 'p-2', lg: 'p-2.5' }
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        iconSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
