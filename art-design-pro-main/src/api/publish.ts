import request from '@/utils/http'

const BASE = '/api'

export function fetchPublishList(status?: string, platform?: string) {
  return request.get({
    url: `${BASE}/publish/list`,
    params: { ...(status ? { status } : {}), ...(platform ? { platform } : {}) }
  })
}

export function fetchPublishStats() {
  return request.get({ url: `${BASE}/publish/stats` })
}

export function fetchAddPublish(data: any) {
  return request.post({ url: `${BASE}/publish/add`, data: data })
}

export function fetchUpdatePublish(id: number, data: any) {
  return request.put({ url: `${BASE}/publish/${id}`, data: data })
}

export function fetchDeletePublish(id: number) {
  return request.del({ url: `${BASE}/publish/${id}` })
}

export function fetchBatchDeletePublish(ids: number[]) {
  return request.del({ url: `${BASE}/publish/batch`, data: { ids } })
}
