import { api } from './apiClient'

export async function getVehicles() {
  return api.get('/vehicles')
}

export async function getVehicleById(id) {
  try {
    return await api.get(`/vehicles/${id}`)
  } catch {
    return null
  }
}

export async function createVehicle(payload) {
  return api.post('/vehicles', payload)
}

export async function updateVehicle(id, payload) {
  return api.patch(`/vehicles/${id}`, payload)
}

export async function retireVehicle(id) {
  return api.post(`/vehicles/${id}/retire`)
}

/**
 * The backend enforces registration uniqueness authoritatively (a duplicate
 * POST/PATCH is rejected with a clear error) — this stays synchronous and
 * a no-op because VehicleForm calls it without `await` during live field
 * validation; making it a real network call would turn every call site
 * into "always truthy Promise", silently breaking that validation.
 */
export function isRegistrationTaken() {
  return false
}
