import request from '@/utils/http'

const BASE = '/api'

export function fetchKuaishouList() {
  return request.get({ url: `${BASE}/kuaishou/list` })
}

export function fetchKuaishouAccounts() {
  return request.get({ url: `${BASE}/kuaishou/accounts` })
}

export function fetchKuaishouSummary() {
  return request.get({ url: `${BASE}/kuaishou/summary` })
}

export function fetchAddKuaishou(data: any) {
  return request.post({ url: `${BASE}/kuaishou/add`, data: data })
}

export function fetchUpdateKuaishou(id: number, data: any) {
  return request.put({ url: `${BASE}/kuaishou/${id}`, data: data })
}

export function fetchDeleteKuaishou(id: number) {
  return request.del({ url: `${BASE}/kuaishou/${id}` })
}

export function fetchBatchDeleteKuaishou(ids: number[]) {
  return request.del({ url: `${BASE}/kuaishou/batch`, data: { ids } })
}
