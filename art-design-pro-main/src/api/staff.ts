import request from '@/utils/http'

const BASE = '/api'

export function fetchStaffList(role?: string) {
  return request.get({ url: `${BASE}/staff/list`, params: role ? { role } : {} })
}

export function fetchStaffRoles() {
  return request.get({ url: `${BASE}/staff/roles` })
}

export function fetchAddStaff(data: any) {
  return request.post({ url: `${BASE}/staff/add`, data: data })
}

export function fetchUpdateStaff(id: number, data: any) {
  return request.put({ url: `${BASE}/staff/${id}`, data: data })
}

export function fetchDeleteStaff(id: number) {
  return request.del({ url: `${BASE}/staff/${id}` })
}

export function fetchBatchDeleteStaff(ids: number[]) {
  return request.del({ url: `${BASE}/staff/batch`, data: { ids } })
}
