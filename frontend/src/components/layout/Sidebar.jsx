import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Truck, X } from 'lucide-react'
import { getSidebarForRole } from '@/config/navigation'
import { ROLE_LABELS } from '@/config/roles'
import { cn } from '@/utils/cn'

function NavItem({ item, onNavigate }) {
  const location = useLocation()
  const hasChildren = !!item.children?.length
  const isChildActive = hasChildren && item.children.some((c) => location.pathname.startsWith(c.path.split('/').slice(0, 2).join('/')))
  const [open, setOpen] = useState(isChildActive)

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isChildActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          )}
        >
          <span className="flex items-center gap-3">
            <item.icon className="size-4.5 shrink-0" />
            {item.label}
          </span>
          <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-700 pl-3">
            {item.children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'block rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive ? 'bg-slate-800 font-medium text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
        )
      }
    >
      <item.icon className="size-4.5 shrink-0" />
      {item.label}
    </NavLink>
  )
}

export function SidebarContent({ role, onNavigate }) {
  const items = getSidebarForRole(role)

  return (
    <div className="flex h-full flex-col bg-slate-900">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Truck className="size-5" />
        </div>
        <div>
          <p className="text-base font-bold leading-none text-white">TransitOps</p>
          <p className="mt-1 text-[11px] font-medium text-slate-400">{ROLE_LABELS[role]}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => (
          <NavItem key={item.path} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="border-t border-slate-800 px-5 py-4">
        <p className="text-[11px] text-slate-500">TransitOps &copy; 2026 &middot; RBAC Enabled</p>
      </div>
    </div>
  )
}

export function Sidebar({ role, mobileOpen, onCloseMobile }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">
          <SidebarContent role={role} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 animate-fade-in" onClick={onCloseMobile} />
          <div className="absolute inset-y-0 left-0 w-72 animate-slide-up">
            <div className="relative h-full">
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="absolute -right-11 top-4 flex size-8 items-center justify-center rounded-lg bg-slate-900/80 text-white"
              >
                <X className="size-4.5" />
              </button>
              <SidebarContent role={role} onNavigate={onCloseMobile} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
