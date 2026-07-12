import { VEHICLE_STATUS } from '@/data/vehicles'
import { DRIVER_STATUS } from '@/data/drivers'

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateLoginForm({ email, password, role }) {
  const errors = {}
  if (!email) errors.email = 'Email is required.'
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Password is required.'
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters.'
  if (!role) errors.role = 'Select a role to continue.'
  return { isValid: Object.keys(errors).length === 0, errors }
}

/**
 * Validates whether a vehicle + driver + cargo combination can be dispatched.
 * Mirrors the trip-assignment rules in the RBAC spec.
 */
export function validateTripAssignment({ vehicle, driver, cargoWeightKg, excludeTripId = null, activeTripsByVehicle = {}, activeTripsByDriver = {} }) {
  const errors = []

  if (vehicle) {
    if (vehicle.status === VEHICLE_STATUS.RETIRED) {
      errors.push(`${vehicle.registration} is retired and cannot be assigned.`)
    }
    if (vehicle.status === VEHICLE_STATUS.IN_SHOP) {
      errors.push(`${vehicle.registration} is currently in maintenance and cannot be assigned.`)
    }
    const conflictingTrip = activeTripsByVehicle[vehicle.id]
    if (conflictingTrip && conflictingTrip !== excludeTripId) {
      errors.push(`${vehicle.registration} is already assigned to an active trip (${conflictingTrip}).`)
    }
    if (cargoWeightKg && Number(cargoWeightKg) > vehicle.capacityKg) {
      errors.push(
        `Cargo weight (${cargoWeightKg} kg) exceeds vehicle capacity (${vehicle.capacityKg} kg) by ${Number(cargoWeightKg) - vehicle.capacityKg} kg.`
      )
    }
  }

  if (driver) {
    if (driver.status === DRIVER_STATUS.SUSPENDED) {
      errors.push(`${driver.name} is suspended and cannot be assigned.`)
    }
    if (driver.status === DRIVER_STATUS.OFF_DUTY) {
      errors.push(`${driver.name} is off duty and cannot be assigned.`)
    }
    const conflictingTrip = activeTripsByDriver[driver.id]
    if (conflictingTrip && conflictingTrip !== excludeTripId) {
      errors.push(`${driver.name} is already assigned to an active trip (${conflictingTrip}).`)
    }
  }

  return { isValid: errors.length === 0, errors }
}
