import request from '@/utils/http'

const BASE = '/api'

export function fetchShootingList(status?: string) {
  return request.get({ url: `${BASE}/shooting/list`, params: status ? { status } : {} })
}

export function fetchAddShooting(data: any) {
  return request.post({ url: `${BASE}/shooting/add`, data: data })
}

export function fetchUpdateShooting(id: number, data: any) {
  return request.put({ url: `${BASE}/shooting/${id}`, data: data })
}

export function fetchDeleteShooting(id: number) {
  return request.del({ url: `${BASE}/shooting/${id}` })
}

export function fetchBatchDeleteShooting(ids: number[]) {
  return request.del({ url: `${BASE}/shooting/batch`, data: { ids } })
}
