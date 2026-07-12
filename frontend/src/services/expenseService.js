import { api } from './apiClient'

export async function getFuelLogs() {
  return api.get('/fuel-logs')
}

export async function createFuelLog(payload) {
  return api.post('/fuel-logs', payload)
}

export async function updateFuelLog(id, payload) {
  return api.patch(`/fuel-logs/${id}`, payload)
}

export async function deleteFuelLog(id) {
  await api.delete(`/fuel-logs/${id}`)
  return true
}

export async function getExpenses() {
  return api.get('/expenses')
}

export async function createExpense(payload) {
  return api.post('/expenses', payload)
}

export async function updateExpense(id, payload) {
  return api.patch(`/expenses/${id}`, payload)
}

export async function deleteExpense(id) {
  await api.delete(`/expenses/${id}`)
  return true
}
