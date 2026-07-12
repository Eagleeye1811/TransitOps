import { MAINTENANCE_RECORDS, MAINTENANCE_STATUS } from '@/data/maintenance'
import { delay } from '@/utils/delay'

let records = [...MAINTENANCE_RECORDS]

export async function getMaintenanceRecords() {
  await delay()
  return [...records]
}

export async function getMaintenanceById(id) {
  await delay(150)
  return records.find((r) => r.id === id) ?? null
}

export async function createMaintenanceRecord(payload) {
  await delay()
  const id = `MNT-${String(records.length + 1).padStart(3, '0')}`
  const record = { id, status: MAINTENANCE_STATUS.SCHEDULED, ...payload }
  records = [record, ...records]
  return record
}

export async function updateMaintenanceRecord(id, payload) {
  await delay()
  records = records.map((r) => (r.id === id ? { ...r, ...payload } : r))
  return records.find((r) => r.id === id)
}

export async function completeMaintenanceRecord(id) {
  return updateMaintenanceRecord(id, { status: MAINTENANCE_STATUS.COMPLETED })
}

export async function cancelMaintenanceRecord(id) {
  return updateMaintenanceRecord(id, { status: MAINTENANCE_STATUS.CANCELLED })
}
