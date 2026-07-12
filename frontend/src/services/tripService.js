import { api, ApiError } from './apiClient'

export async function getTrips() {
  return api.get('/trips')
}

export async function getTripById(id) {
  try {
    return await api.get(`/trips/${id}`)
  } catch {
    return null
  }
}

export async function validateAssignment({ vehicleId, driverId, cargoWeightKg, excludeTripId = null }) {
  const result = await api.post('/trips/validate-assignment', {
    vehicleId,
    driverId,
    cargoWeightKg,
    excludeTripId,
  })
  return { isValid: result.isValid, errors: result.errors }
}

export async function createTrip(payload) {
  return api.post('/trips', payload)
}

export async function updateTrip(id, payload) {
  return api.patch(`/trips/${id}`, payload)
}

export async function dispatchTrip(id) {
  try {
    const trip = await api.post(`/trips/${id}/dispatch`)
    return { success: true, trip }
  } catch (err) {
    if (err instanceof ApiError) return { success: false, errors: err.errors }
    return { success: false, errors: ['Something went wrong. Please try again.'] }
  }
}

export async function cancelTrip(id, reason) {
  return api.post(`/trips/${id}/cancel`, { reason })
}

export async function completeTrip(id) {
  return api.post(`/trips/${id}/complete`)
}
