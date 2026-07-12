import { VEHICLES } from '@/data/vehicles'
import { delay } from '@/utils/delay'

let vehicles = [...VEHICLES]

export async function getVehicles() {
  await delay()
  return [...vehicles]
}

export async function getVehicleById(id) {
  await delay(150)
  return vehicles.find((v) => v.id === id) ?? null
}

export async function createVehicle(payload) {
  await delay()
  const id = `VEH-${String(vehicles.length + 1).padStart(3, '0')}`
  const vehicle = {
    id,
    utilisation: 0,
    operationalCostMonthly: 0,
    roi: 0,
    odometerKm: 0,
    ...payload,
  }
  vehicles = [vehicle, ...vehicles]
  return vehicle
}

export async function updateVehicle(id, payload) {
  await delay()
  vehicles = vehicles.map((v) => (v.id === id ? { ...v, ...payload } : v))
  return vehicles.find((v) => v.id === id)
}

export async function retireVehicle(id) {
  await delay()
  vehicles = vehicles.map((v) => (v.id === id ? { ...v, status: 'retired', utilisation: 0 } : v))
  return vehicles.find((v) => v.id === id)
}

export function isRegistrationTaken(registration, excludeId = null) {
  return vehicles.some(
    (v) => v.registration.toLowerCase() === registration.toLowerCase() && v.id !== excludeId
  )
}
