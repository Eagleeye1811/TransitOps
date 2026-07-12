import { USERS, findUserByEmail } from '@/data/users'
import { isValidRole, ROLE_LABELS } from '@/config/roles'
import { delay } from '@/utils/delay'

function sanitize(user) {
  // eslint-disable-next-line no-unused-vars
  const { password, ...safe } = user
  return safe
}

/**
 * Authenticates against mock user data. The role picked in the login form is
 * only a claim — access is granted only if it matches the role stored on the
 * account record.
 */
export async function login({ email, password, role }) {
  await delay(400)

  if (!isValidRole(role)) {
    return { success: false, error: 'Select a valid role to continue.' }
  }

  const user = findUserByEmail(email)
  if (!user || user.password !== password) {
    return { success: false, error: 'Invalid credentials. Please check your email and password.' }
  }

  if (user.status !== 'active') {
    return {
      success: false,
      error:
        user.status === 'locked'
          ? 'This account is locked after too many failed attempts. Contact your administrator.'
          : 'This account has been deactivated. Contact your administrator.',
    }
  }

  if (user.role !== role) {
    return {
      success: false,
      error: 'The selected role does not match the role assigned to this account.',
    }
  }

  return { success: true, user: sanitize(user) }
}

export async function getUserById(id) {
  await delay(100)
  const user = USERS.find((u) => u.id === id)
  return user ? sanitize(user) : null
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] ?? role
}
