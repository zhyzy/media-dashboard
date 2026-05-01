import request from '@/utils/http'

export function fetchLogin(params: { username: string; password: string }) {
  return request.post({
    url: '/api/auth/login',
    params
  })
}

export function fetchGetUserInfo() {
  return request.get({
    url: '/api/auth/profile'
  })
}
