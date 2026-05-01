import request from '@/utils/http'

export function fetchActivityRecent() {
  return request.get({ url: '/api/activity/recent' })
}
