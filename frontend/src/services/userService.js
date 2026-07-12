import { api } from './apiClient'

export async function getUsers() {
  return api.get('/users')
}

export async function createUser(payload) {
  // UserForm doesn't collect a password (the product spec never asked for
  // one at creation time) — the backend requires one to hash & store, so
  // generate a temporary one here. A real deployment would email this / a
  // reset link to the new user; that's out of scope for this prototype.
  const temporaryPassword = `Welcome@${Math.floor(1000 + Math.random() * 9000)}`
  return api.post('/users', { ...payload, password: temporaryPassword })
}

export async function updateUser(id, payload) {
  return api.patch(`/users/${id}`, payload)
}

export async function setUserStatus(id, status) {
  return api.patch(`/users/${id}/status`, { status })
}

export async function assignRole(id, role) {
  return api.patch(`/users/${id}/role`, { role })
}

export async function resetAccount(id) {
  return api.post(`/users/${id}/reset`)
}
