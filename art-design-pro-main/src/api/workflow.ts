import request from '@/utils/http'

const BASE = '/api'

export function fetchWorkflowOverview() {
  return request.get({ url: `${BASE}/workflow/overview` })
}

export function fetchRecentScripts(limit?: number) {
  return request.get({ url: `${BASE}/workflow/recent-scripts`, params: limit ? { limit } : {} })
}

export function fetchRecentShootings(limit?: number) {
  return request.get({ url: `${BASE}/workflow/recent-shootings`, params: limit ? { limit } : {} })
}

export function fetchRecentPublishes(limit?: number) {
  return request.get({ url: `${BASE}/workflow/recent-publishes`, params: limit ? { limit } : {} })
}
