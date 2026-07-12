import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  ShieldCheck,
  Settings,
  UserCog,
  KeySquare,
} from 'lucide-react'
import { MODULES, canAccessModule } from './permissions'

// Master nav tree, in canonical display order. Visibility is derived from
// the permission matrix — never hardcode per-role lists here.
const NAV_TREE = [
  { module: MODULES.DASHBOARD, label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { module: MODULES.FLEET, label: 'Fleet', path: '/fleet', icon: Truck },
  { module: MODULES.DRIVERS, label: 'Drivers', path: '/drivers', icon: Users },
  { module: MODULES.TRIPS, label: 'Trips', path: '/trips', icon: Route },
  { module: MODULES.MAINTENANCE, label: 'Maintenance', path: '/maintenance', icon: Wrench },
  { module: MODULES.EXPENSES, label: 'Fuel & Expenses', path: '/expenses', icon: Fuel },
  { module: MODULES.ANALYTICS, label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { module: MODULES.COMPLIANCE, label: 'Compliance', path: '/compliance', icon: ShieldCheck },
  {
    module: MODULES.SETTINGS,
    label: 'Settings',
    path: '/settings/general',
    icon: Settings,
    children: [
      { module: MODULES.SETTINGS, label: 'General', path: '/settings/general', icon: Settings },
      { module: MODULES.USERS, label: 'Users', path: '/settings/users', icon: UserCog },
      { module: MODULES.RBAC, label: 'Roles & Permissions', path: '/settings/roles', icon: KeySquare },
    ],
  },
]

/** Builds the sidebar nav list for a given role, hiding anything the role cannot access. */
export function getSidebarForRole(role) {
  return NAV_TREE.filter((item) => canAccessModule(role, item.module))
    .map((item) => {
      if (!item.children) return item
      const children = item.children.filter((child) => canAccessModule(role, child.module))
      if (children.length === 0) return null
      return { ...item, children }
    })
    .filter(Boolean)
}
