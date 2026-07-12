import { api } from './apiClient'

export async function getIncidents() {
  return api.get('/safety/incidents')
}

export async function createIncident(payload) {
  return api.post('/safety/incidents', payload)
}

export async function updateIncident(id, payload) {
  return api.patch(`/safety/incidents/${id}`, payload)
}

export async function getViolations() {
  return api.get('/safety/violations')
}

export async function createViolation(payload) {
  return api.post('/safety/violations', payload)
}

export async function updateViolation(id, payload) {
  return api.patch(`/safety/violations/${id}`, payload)
}
