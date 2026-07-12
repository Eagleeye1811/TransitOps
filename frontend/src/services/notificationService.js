import { api } from './apiClient'

export async function getNotifications() {
  return api.get('/notifications')
}

export async function markNotificationRead(id) {
  return api.patch(`/notifications/${id}/read`)
}
