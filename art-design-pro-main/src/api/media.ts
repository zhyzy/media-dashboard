import request from '@/utils/http'

const BASE = '/api'

export function fetchMediaList(platform?: string) {
  return request.get({ url: `${BASE}/media/list`, params: platform ? { platform } : {} })
}

export function fetchMediaSummary() {
  return request.get({ url: `${BASE}/media/summary` })
}

export function fetchAddMedia(data: any) {
  return request.post({ url: `${BASE}/media/add`, data: data })
}

export function fetchUpdateMedia(id: number, data: any) {
  return request.put({ url: `${BASE}/media/${id}`, data: data })
}

export function fetchDeleteMedia(id: number) {
  return request.del({ url: `${BASE}/media/${id}` })
}

export function fetchBatchDeleteMedia(ids: number[]) {
  return request.del({ url: `${BASE}/media/batch`, data: { ids } })
}
