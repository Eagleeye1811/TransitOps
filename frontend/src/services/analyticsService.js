import { api } from './apiClient'

export async function getAnalyticsSummary() {
  return api.get('/analytics/summary')
}
