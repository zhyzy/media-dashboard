import request from '@/utils/http'

const BASE = '/api'

export function fetchDouyinList() {
  return request.get({ url: `${BASE}/douyin/list` })
}

export function fetchDouyinAccounts() {
  return request.get({ url: `${BASE}/douyin/accounts` })
}

export function fetchDouyinSummary() {
  return request.get({ url: `${BASE}/douyin/summary` })
}

export function fetchDouyinTrend(days: number = 7) {
  return request.get({ url: `${BASE}/douyin/trend`, params: { days } })
}

export function fetchAddDouyin(data: any) {
  return request.post({ url: `${BASE}/douyin/add`, data: data })
}

export function fetchUpdateDouyin(id: number, data: any) {
  return request.put({ url: `${BASE}/douyin/${id}`, data: data })
}

export function fetchDeleteDouyin(id: number) {
  return request.del({ url: `${BASE}/douyin/${id}` })
}

export function fetchBatchDeleteDouyin(ids: number[]) {
  return request.del({ url: `${BASE}/douyin/batch`, data: { ids } })
}
