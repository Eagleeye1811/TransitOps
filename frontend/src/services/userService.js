import { USERS } from '@/data/users'
import { delay } from '@/utils/delay'

// eslint-disable-next-line no-unused-vars
let users = USERS.map(({ password, ...rest }) => rest)

export async function getUsers() {
  await delay()
  return [...users]
}

export async function createUser(payload) {
  await delay()
  const id = `USR-${String(users.length + 1).padStart(3, '0')}`
  const user = { id, status: 'active', createdAt: new Date().toISOString(), lastLogin: null, ...payload }
  users = [user, ...users]
  return user
}

export async function updateUser(id, payload) {
  await delay()
  users = users.map((u) => (u.id === id ? { ...u, ...payload } : u))
  return users.find((u) => u.id === id)
}

export async function setUserStatus(id, status) {
  return updateUser(id, { status })
}

export async function assignRole(id, role) {
  return updateUser(id, { role })
}

export async function resetAccount(id) {
  return updateUser(id, { status: 'active' })
}
