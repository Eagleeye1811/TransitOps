import { api } from './apiClient'

export async function getMaintenanceRecords() {
  return api.get('/maintenance')
}

export async function getMaintenanceById(id) {
  try {
    return await api.get(`/maintenance/${id}`)
  } catch {
    return null
  }
}

export async function createMaintenanceRecord(payload) {
  return api.post('/maintenance', payload)
}

export async function updateMaintenanceRecord(id, payload) {
  return api.patch(`/maintenance/${id}`, payload)
}

export async function completeMaintenanceRecord(id) {
  return api.post(`/maintenance/${id}/complete`)
}

export async function cancelMaintenanceRecord(id) {
  return api.post(`/maintenance/${id}/cancel`)
}
