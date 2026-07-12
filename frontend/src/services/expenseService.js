import { FUEL_LOGS, EXPENSES } from '@/data/fuelLogs'
import { delay } from '@/utils/delay'

let fuelLogs = [...FUEL_LOGS]
let expenses = [...EXPENSES]

export async function getFuelLogs() {
  await delay()
  return [...fuelLogs]
}

export async function createFuelLog(payload) {
  await delay()
  const id = `FUEL-${String(fuelLogs.length + 1).padStart(3, '0')}`
  const log = { id, ...payload }
  fuelLogs = [log, ...fuelLogs]
  return log
}

export async function updateFuelLog(id, payload) {
  await delay()
  fuelLogs = fuelLogs.map((f) => (f.id === id ? { ...f, ...payload } : f))
  return fuelLogs.find((f) => f.id === id)
}

export async function deleteFuelLog(id) {
  await delay()
  fuelLogs = fuelLogs.filter((f) => f.id !== id)
  return true
}

export async function getExpenses() {
  await delay()
  return [...expenses]
}

export async function createExpense(payload) {
  await delay()
  const id = `EXP-${String(expenses.length + 1).padStart(3, '0')}`
  const expense = { id, ...payload }
  expenses = [expense, ...expenses]
  return expense
}

export async function updateExpense(id, payload) {
  await delay()
  expenses = expenses.map((e) => (e.id === id ? { ...e, ...payload } : e))
  return expenses.find((e) => e.id === id)
}

export async function deleteExpense(id) {
  await delay()
  expenses = expenses.filter((e) => e.id !== id)
  return true
}
