import { useState } from 'react'
import { cn } from '@/utils/cn'

export function Tooltip({ content, children, side = 'top', className }) {
  const [open, setOpen] = useState(false)

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && content && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 w-max max-w-56 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg animate-fade-in',
            sideClasses[side],
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}
