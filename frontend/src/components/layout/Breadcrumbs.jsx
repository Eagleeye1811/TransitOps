import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export function Breadcrumbs({ crumbs = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <Link to="/dashboard" className="flex items-center hover:text-slate-700 dark:hover:text-slate-200">
        <Home className="size-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="size-3.5 text-slate-300 dark:text-slate-600" />
          {crumb.path && i !== crumbs.length - 1 ? (
            <Link to={crumb.path} className="hover:text-slate-700 dark:hover:text-slate-200">
              {crumb.label}
            </Link>
          ) : (
            <span className={i === crumbs.length - 1 ? 'font-medium text-slate-700 dark:text-slate-200' : ''}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
