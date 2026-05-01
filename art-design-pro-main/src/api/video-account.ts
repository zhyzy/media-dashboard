import request from '@/utils/http'

const BASE = '/api'

export function fetchVideoAccountList() {
  return request.get({ url: `${BASE}/video-account/list` })
}

export function fetchVideoAccountAccounts() {
  return request.get({ url: `${BASE}/video-account/accounts` })
}

export function fetchVideoAccountSummary() {
  return request.get({ url: `${BASE}/video-account/summary` })
}

export function fetchAddVideoAccount(data: any) {
  return request.post({ url: `${BASE}/video-account/add`, data: data })
}

export function fetchUpdateVideoAccount(id: number, data: any) {
  return request.put({ url: `${BASE}/video-account/${id}`, data: data })
}

export function fetchDeleteVideoAccount(id: number) {
  return request.del({ url: `${BASE}/video-account/${id}` })
}

export function fetchBatchDeleteVideoAccount(ids: number[]) {
  return request.del({ url: `${BASE}/video-account/batch`, data: { ids } })
}
