import { api } from './apiClient'

export async function getDrivers() {
  return api.get('/drivers')
}

export async function getDriverById(id) {
  try {
    return await api.get(`/drivers/${id}`)
  } catch {
    return null
  }
}

export async function createDriver(payload) {
  return api.post('/drivers', payload)
}

export async function updateDriver(id, payload) {
  return api.patch(`/drivers/${id}`, payload)
}

export async function updateDriverStatus(id, status) {
  return api.patch(`/drivers/${id}/status`, { status })
}
