import { usePermissions } from '@/hooks/usePermissions'

/**
 * Hides (or optionally disables via `fallback`) UI when the current user
 * lacks access to a module, or a specific action within it.
 *
 * <PermissionGate module={MODULES.FLEET} action={ACTIONS.EDIT}>
 *   <Button>Edit vehicle</Button>
 * </PermissionGate>
 */
export function PermissionGate({ module, action, children, fallback = null }) {
  const { can, canDo } = usePermissions()

  const allowed = action ? canDo(module, action) : can(module)
  if (!allowed) return fallback
  return children
}
