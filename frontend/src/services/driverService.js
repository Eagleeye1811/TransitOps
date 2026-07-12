import { DRIVERS } from '@/data/drivers'
import { delay } from '@/utils/delay'

let drivers = [...DRIVERS]

export async function getDrivers() {
  await delay()
  return [...drivers]
}

export async function getDriverById(id) {
  await delay(150)
  return drivers.find((d) => d.id === id) ?? null
}

export async function createDriver(payload) {
  await delay()
  const id = `DRV-${String(drivers.length + 1).padStart(3, '0')}`
  const driver = {
    id,
    safetyScore: 100,
    tripsCompleted: 0,
    currentAssignment: null,
    ...payload,
  }
  drivers = [driver, ...drivers]
  return driver
}

export async function updateDriver(id, payload) {
  await delay()
  drivers = drivers.map((d) => (d.id === id ? { ...d, ...payload } : d))
  return drivers.find((d) => d.id === id)
}

export async function updateDriverStatus(id, status) {
  await delay()
  drivers = drivers.map((d) => (d.id === id ? { ...d, status } : d))
  return drivers.find((d) => d.id === id)
}
