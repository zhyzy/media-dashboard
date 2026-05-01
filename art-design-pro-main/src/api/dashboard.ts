import request from '@/utils/http'

export function fetchDashboardSummary() {
  return request.get({ url: '/api/dashboard/summary' })
}

export function fetchDashboardTrend(days: number = 14) {
  return request.get({ url: '/api/dashboard/trend', params: { days } })
}
