import { TRIPS, TRIP_STATUS } from '@/data/trips'
import { VEHICLE_STATUS } from '@/data/vehicles'
import { DRIVER_STATUS } from '@/data/drivers'
import { delay } from '@/utils/delay'
import { validateTripAssignment } from '@/utils/validators'
import * as fleetService from './fleetService'
import * as driverService from './driverService'

let trips = [...TRIPS]

function activeAssignmentMaps() {
  const activeTripsByVehicle = {}
  const activeTripsByDriver = {}
  trips
    .filter((t) => t.status === TRIP_STATUS.DISPATCHED)
    .forEach((t) => {
      if (t.vehicleId) activeTripsByVehicle[t.vehicleId] = t.id
      if (t.driverId) activeTripsByDriver[t.driverId] = t.id
    })
  return { activeTripsByVehicle, activeTripsByDriver }
}

export async function getTrips() {
  await delay()
  return [...trips]
}

export async function getTripById(id) {
  await delay(150)
  return trips.find((t) => t.id === id) ?? null
}

/** Validates a proposed vehicle/driver/cargo combination against live trip data. */
export async function validateAssignment({ vehicleId, driverId, cargoWeightKg, excludeTripId = null }) {
  const [vehicle, driver] = await Promise.all([
    vehicleId ? fleetService.getVehicleById(vehicleId) : null,
    driverId ? driverService.getDriverById(driverId) : null,
  ])
  const { activeTripsByVehicle, activeTripsByDriver } = activeAssignmentMaps()
  return validateTripAssignment({
    vehicle,
    driver,
    cargoWeightKg,
    excludeTripId,
    activeTripsByVehicle,
    activeTripsByDriver,
  })
}

export async function createTrip(payload) {
  await delay()
  const id = `TRIP-${String(trips.length + 1).padStart(3, '0')}`
  const trip = {
    id,
    status: TRIP_STATUS.DRAFT,
    createdAt: new Date().toISOString(),
    vehicleId: null,
    driverId: null,
    ...payload,
  }
  trips = [trip, ...trips]
  return trip
}

export async function updateTrip(id, payload) {
  await delay()
  trips = trips.map((t) => (t.id === id ? { ...t, ...payload } : t))
  return trips.find((t) => t.id === id)
}

export async function dispatchTrip(id) {
  await delay()
  const trip = trips.find((t) => t.id === id)
  if (!trip) throw new Error('Trip not found.')

  const validation = await validateAssignment({
    vehicleId: trip.vehicleId,
    driverId: trip.driverId,
    cargoWeightKg: trip.cargoWeightKg,
    excludeTripId: id,
  })
  if (!trip.vehicleId || !trip.driverId) {
    validation.isValid = false
    validation.errors.push('Both a vehicle and a driver must be assigned before dispatch.')
  }
  if (!validation.isValid) {
    return { success: false, errors: validation.errors }
  }

  trips = trips.map((t) =>
    t.id === id ? { ...t, status: TRIP_STATUS.DISPATCHED, dispatchedAt: new Date().toISOString() } : t
  )
  await fleetService.updateVehicle(trip.vehicleId, { status: VEHICLE_STATUS.ON_TRIP })
  await driverService.updateDriverStatus(trip.driverId, DRIVER_STATUS.ON_TRIP)
  await driverService.updateDriver(trip.driverId, { currentAssignment: id })
  return { success: true, trip: trips.find((t) => t.id === id) }
}

export async function cancelTrip(id, reason) {
  await delay()
  const trip = trips.find((t) => t.id === id)
  if (!trip) throw new Error('Trip not found.')
  trips = trips.map((t) => (t.id === id ? { ...t, status: TRIP_STATUS.CANCELLED, cancelReason: reason } : t))
  if (trip.status === TRIP_STATUS.DISPATCHED) {
    if (trip.vehicleId) await fleetService.updateVehicle(trip.vehicleId, { status: VEHICLE_STATUS.AVAILABLE })
    if (trip.driverId) {
      await driverService.updateDriverStatus(trip.driverId, DRIVER_STATUS.AVAILABLE)
      await driverService.updateDriver(trip.driverId, { currentAssignment: null })
    }
  }
  return trips.find((t) => t.id === id)
}

export async function completeTrip(id) {
  await delay()
  const trip = trips.find((t) => t.id === id)
  if (!trip) throw new Error('Trip not found.')
  trips = trips.map((t) =>
    t.id === id ? { ...t, status: TRIP_STATUS.COMPLETED, completedAt: new Date().toISOString() } : t
  )
  if (trip.vehicleId) await fleetService.updateVehicle(trip.vehicleId, { status: VEHICLE_STATUS.AVAILABLE })
  if (trip.driverId) {
    await driverService.updateDriverStatus(trip.driverId, DRIVER_STATUS.AVAILABLE)
    await driverService.updateDriver(trip.driverId, { currentAssignment: null })
  }
  return trips.find((t) => t.id === id)
}
