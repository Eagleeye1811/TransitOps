import { api } from './apiClient'

// The backend stores notification prefs as flat columns
// (notify_email/notify_sms/notify_licence_expiry/notify_maintenance); the
// frontend's mock shape nests them under `notifications`. Reshape at this
// boundary so GeneralSettingsPage never has to know the difference.
function toFrontendShape(data) {
  const { notifyEmail, notifySms, notifyLicenceExpiry, notifyMaintenance, ...rest } = data
  return {
    ...rest,
    notifications: {
      email: notifyEmail,
      sms: notifySms,
      licenceExpiryAlerts: notifyLicenceExpiry,
      maintenanceAlerts: notifyMaintenance,
    },
  }
}

function toBackendShape(payload) {
  const { notifications, ...rest } = payload
  if (!notifications) return rest
  return {
    ...rest,
    notifyEmail: notifications.email,
    notifySms: notifications.sms,
    notifyLicenceExpiry: notifications.licenceExpiryAlerts,
    notifyMaintenance: notifications.maintenanceAlerts,
  }
}

export async function getOrgSettings() {
  const data = await api.get('/settings/org')
  return toFrontendShape(data)
}

export async function updateOrgSettings(payload) {
  const data = await api.patch('/settings/org', toBackendShape(payload))
  return toFrontendShape(data)
}

export async function runReminderSweep() {
  return api.post('/settings/run-reminder-sweep')
}
