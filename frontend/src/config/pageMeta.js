import { matchPath } from 'react-router-dom'

// Ordered most-specific-first so matchPath doesn't let a param route
// (e.g. /fleet/:id) swallow a literal one (e.g. /fleet/new).
const ROUTES_META = [
  { path: '/dashboard', title: 'Dashboard', crumbs: [{ label: 'Dashboard' }] },

  { path: '/fleet/new', title: 'Add Vehicle', crumbs: [{ label: 'Fleet', path: '/fleet' }, { label: 'Add Vehicle' }] },
  { path: '/fleet/:id/edit', title: 'Edit Vehicle', crumbs: [{ label: 'Fleet', path: '/fleet' }, { label: 'Edit Vehicle' }] },
  { path: '/fleet/:id', title: 'Vehicle Details', crumbs: [{ label: 'Fleet', path: '/fleet' }, { label: 'Vehicle Details' }] },
  { path: '/fleet', title: 'Fleet', crumbs: [{ label: 'Fleet' }] },

  { path: '/drivers/new', title: 'Add Driver', crumbs: [{ label: 'Drivers', path: '/drivers' }, { label: 'Add Driver' }] },
  { path: '/drivers/:id/edit', title: 'Edit Driver', crumbs: [{ label: 'Drivers', path: '/drivers' }, { label: 'Edit Driver' }] },
  { path: '/drivers/:id', title: 'Driver Details', crumbs: [{ label: 'Drivers', path: '/drivers' }, { label: 'Driver Details' }] },
  { path: '/drivers', title: 'Drivers', crumbs: [{ label: 'Drivers' }] },

  { path: '/trips/new', title: 'New Trip', crumbs: [{ label: 'Trips', path: '/trips' }, { label: 'New Trip' }] },
  { path: '/trips/:id/edit', title: 'Edit Trip', crumbs: [{ label: 'Trips', path: '/trips' }, { label: 'Edit Trip' }] },
  { path: '/trips/:id', title: 'Trip Details', crumbs: [{ label: 'Trips', path: '/trips' }, { label: 'Trip Details' }] },
  { path: '/trips', title: 'Trips', crumbs: [{ label: 'Trips' }] },

  { path: '/maintenance/new', title: 'Log Maintenance', crumbs: [{ label: 'Maintenance', path: '/maintenance' }, { label: 'Log Maintenance' }] },
  { path: '/maintenance/:id', title: 'Maintenance Details', crumbs: [{ label: 'Maintenance', path: '/maintenance' }, { label: 'Maintenance Details' }] },
  { path: '/maintenance', title: 'Maintenance', crumbs: [{ label: 'Maintenance' }] },

  { path: '/expenses', title: 'Fuel & Expenses', crumbs: [{ label: 'Fuel & Expenses' }] },
  { path: '/analytics', title: 'Analytics', crumbs: [{ label: 'Analytics' }] },
  { path: '/compliance', title: 'Compliance', crumbs: [{ label: 'Compliance' }] },

  { path: '/settings/general', title: 'General Settings', crumbs: [{ label: 'Settings', path: '/settings/general' }, { label: 'General' }] },
  { path: '/settings/users', title: 'User Management', crumbs: [{ label: 'Settings', path: '/settings/general' }, { label: 'Users' }] },
  { path: '/settings/roles', title: 'Roles & Permissions', crumbs: [{ label: 'Settings', path: '/settings/general' }, { label: 'Roles & Permissions' }] },

  { path: '/profile', title: 'My Profile', crumbs: [{ label: 'Profile' }] },
  { path: '/unauthorized', title: 'Access Denied', crumbs: [{ label: 'Access Denied' }] },
]

export function getPageMeta(pathname) {
  for (const route of ROUTES_META) {
    if (matchPath({ path: route.path, end: true }, pathname)) return route
  }
  return { title: 'TransitOps', crumbs: [] }
}
