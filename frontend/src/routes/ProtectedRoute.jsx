import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isValidRole } from '@/config/roles'
import { canAccessModule, canPerformAction } from '@/config/permissions'

/** Gate for the whole authenticated app shell. */
export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

/**
 * Gate for an individual module/route. Wrap a page element:
 *   <Route path="/fleet" element={<RequireModule module={MODULES.FLEET}><FleetListPage /></RequireModule>} />
 * Optionally require a specific action (e.g. ACTIONS.CREATE) beyond bare view access.
 * `action` may also be an array — access is granted if ANY listed action is permitted
 * (e.g. driver edit is reachable by either full EDIT or the reduced EDIT_OPERATIONAL).
 */
export function RequireModule({ module, action, children }) {
  const { role, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  // Unknown/missing role never defaults to elevated access.
  if (!isValidRole(role)) return <Navigate to="/unauthorized" replace />

  let allowed
  if (!action) {
    allowed = canAccessModule(role, module)
  } else if (Array.isArray(action)) {
    allowed = action.some((a) => canPerformAction(role, module, a))
  } else {
    allowed = canPerformAction(role, module, action)
  }
  if (!allowed) return <Navigate to="/unauthorized" replace />

  return children
}
