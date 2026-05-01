import request from '@/utils/http'

const BASE = '/api'

export function fetchSubAccountList() {
  return request.get({ url: `${BASE}/account/sub/list` })
}

export function fetchPermissionList() {
  return request.get({ url: `${BASE}/account/permissions` })
}

export function fetchCreateSubAccount(data: any) {
  return request.post({ url: `${BASE}/account/sub`, data: data })
}

export function fetchUpdateSubAccount(id: number, data: any) {
  return request.put({ url: `${BASE}/account/sub/${id}`, data: data })
}

export function fetchDeleteSubAccount(id: number) {
  return request.del({ url: `${BASE}/account/sub/${id}` })
}

export function fetchBatchDeleteSubAccount(ids: number[]) {
  return request.del({ url: `${BASE}/account/sub/batch`, data: { ids } })
}
