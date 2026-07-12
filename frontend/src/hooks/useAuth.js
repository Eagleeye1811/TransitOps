import { useAuthStore } from '@/context/authStore'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const updateUser = useAuthStore((s) => s.updateUser)

  return { user, role, isAuthenticated, login, logout, updateUser }
}
