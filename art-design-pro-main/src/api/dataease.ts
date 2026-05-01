import request from '@/utils/http'

const BASE = '/api'

export function fetchDataeaseKeys() {
  return request.get({ url: `${BASE}/dataease/keys` })
}

export function fetchCreateDataeaseKey(name?: string) {
  return request.post({ url: `${BASE}/dataease/keys`, params: { name } })
}

export function fetchDeleteDataeaseKey(id: number) {
  return request.del({ url: `${BASE}/dataease/keys/${id}` })
}

export function fetchToggleDataeaseKey(id: number) {
  return request.post({ url: `${BASE}/dataease/keys/${id}/toggle` })
}
