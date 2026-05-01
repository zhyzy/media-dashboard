import request from '@/utils/http'

const BASE = '/api'

export function fetchScriptList(status?: string) {
  return request.get({ url: `${BASE}/script/list`, params: status ? { status } : {} })
}

export function fetchScriptStats() {
  return request.get({ url: `${BASE}/script/stats` })
}

export function fetchAddScript(data: any) {
  return request.post({ url: `${BASE}/script/add`, data: data })
}

export function fetchUpdateScript(id: number, data: any) {
  return request.put({ url: `${BASE}/script/${id}`, data: data })
}

export function fetchDeleteScript(id: number) {
  return request.del({ url: `${BASE}/script/${id}` })
}

export function fetchBatchDeleteScript(ids: number[]) {
  return request.del({ url: `${BASE}/script/batch`, data: { ids } })
}
