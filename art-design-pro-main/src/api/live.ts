import request from '@/utils/http'

const BASE = '/api'

export function fetchLiveList(platform?: string) {
  return request.get({ url: `${BASE}/live/list`, params: platform ? { platform } : {} })
}

export function fetchLiveSummary() {
  return request.get({ url: `${BASE}/live/summary` })
}

export function fetchAddLive(data: any) {
  return request.post({ url: `${BASE}/live/add`, data: data })
}

export function fetchUpdateLive(id: number, data: any) {
  return request.put({ url: `${BASE}/live/${id}`, data: data })
}

export function fetchDeleteLive(id: number) {
  return request.del({ url: `${BASE}/live/${id}` })
}

export function fetchBatchDeleteLive(ids: number[]) {
  return request.del({ url: `${BASE}/live/batch`, data: { ids } })
}
