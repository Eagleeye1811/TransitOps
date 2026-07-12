import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { getPageMeta } from '@/config/pageMeta'
import { Breadcrumbs } from './Breadcrumbs'
import { RoleBadge } from './RoleBadge'
import { NotificationBell } from './NotificationBell'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import { useAuth } from '@/hooks/useAuth'

export function Topbar({ onOpenMobileSidebar }) {
  const location = useLocation()
  const { role } = useAuth()
  const meta = getPageMeta(location.pathname)

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-900/90">
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">{meta.title}</h1>
        <Breadcrumbs crumbs={meta.crumbs} />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <RoleBadge role={role} className="hidden md:inline-flex" />
        <ThemeToggle />
        <NotificationBell />
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
        <UserMenu />
      </div>
    </header>
  )
}
