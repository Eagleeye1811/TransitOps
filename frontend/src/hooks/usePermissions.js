import { useMemo } from 'react'
import { useAuthStore } from '@/context/authStore'
import { getModuleAccess, canAccessModule, canPerformAction } from '@/config/permissions'

/**
 * Central hook for all role/permission checks in components.
 * Never inline `role === 'admin'` checks — go through this hook instead.
 */
export function usePermissions() {
  const role = useAuthStore((s) => s.role)

  return useMemo(
    () => ({
      role,
      access: (module) => getModuleAccess(role, module),
      can: (module) => canAccessModule(role, module),
      canDo: (module, action) => canPerformAction(role, module, action),
    }),
    [role]
  )
}
