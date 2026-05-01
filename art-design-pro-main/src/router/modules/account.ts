import { AppRouteRecord } from '@/types/router'

export const accountRoutes: AppRouteRecord = {
  path: '/account',
  name: 'Account',
  component: '/index/index',
  meta: {
    title: '账户管理',
    icon: 'ri:shield-user-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'sub-accounts',
      name: 'SubAccounts',
      component: '/account/sub-accounts/index',
      meta: {
        title: '子账户管理',
        icon: 'ri-user-settings-line',
        keepAlive: false
      }
    }
  ]
}
