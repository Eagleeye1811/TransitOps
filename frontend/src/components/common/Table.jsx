import { cn } from '@/utils/cn'

export function TableContainer({ children, className }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      <table className="w-full min-w-max text-left text-sm">{children}</table>
    </div>
  )
}

export function THead({ children }) {
  return <thead className="border-b border-slate-200 bg-slate-50">{children}</thead>
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>
}

export function TR({ children, className, onClick }) {
  return (
    <tr
      onClick={onClick}
      className={cn(onClick && 'cursor-pointer hover:bg-slate-50 transition-colors', className)}
    >
      {children}
    </tr>
  )
}

export function TH({ children, className }) {
  return (
    <th
      scope="col"
      className={cn('whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500', className)}
    >
      {children}
    </th>
  )
}

export function TD({ children, className }) {
  return <td className={cn('whitespace-nowrap px-4 py-3.5 text-sm text-slate-700', className)}>{children}</td>
}
