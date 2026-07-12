import { ROLE_LABELS } from '@/config/roles'
import { api, ApiError } from './apiClient'

/**
 * Authenticates against the real backend. The role picked in the login form
 * is only a claim — access is granted only if it matches the role stored on
 * the account record (enforced server-side in `/auth/login`).
 */
export async function login({ email, password, role }) {
  try {
    const data = await api.post('/auth/login', { email, password, role })
    return { success: true, user: data.user, token: data.token }
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.message }
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function getUserById(id) {
  try {
    return await api.get(`/users/${id}`)
  } catch {
    return null
  }
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] ?? role
}
