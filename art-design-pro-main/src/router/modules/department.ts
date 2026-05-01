import { AppRouteRecord } from '@/types/router'

export const departmentRoutes: AppRouteRecord = {
  path: '/department',
  name: 'Department',
  component: '/index/index',
  meta: {
    title: '部门管理',
    icon: 'ri:team-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'staff',
      name: 'Staff',
      component: '/department/staff/index',
      meta: {
        title: '人员管理',
        icon: 'ri:user-line',
        keepAlive: false
      }
    },
    {
      path: 'expense',
      name: 'Expense',
      component: '/department/expense/index',
      meta: {
        title: '费用管理',
        icon: 'ri:money-cny-circle-line',
        keepAlive: false
      }
    }
  ]
}
