import { api } from './apiClient'

export async function getActivity(limit = 50) {
  return api.get('/activity', { limit })
}
