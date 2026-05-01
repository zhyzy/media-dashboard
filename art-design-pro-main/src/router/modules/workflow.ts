import { AppRouteRecord } from '@/types/router'

export const workflowRoutes: AppRouteRecord = {
  path: '/workflow',
  name: 'Workflow',
  component: '/index/index',
  meta: {
    title: '工作流',
    icon: 'ri:flow-chart',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'overview',
      name: 'WorkflowOverview',
      component: '/workflow/overview/index',
      meta: {
        title: '工作流概览',
        icon: 'ri:dashboard-line',
        keepAlive: false
      }
    },
    {
      path: 'script',
      name: 'Script',
      component: '/workflow/script/index',
      meta: {
        title: '剧本管理',
        icon: 'ri:file-text-line',
        keepAlive: false
      }
    },
    {
      path: 'shooting',
      name: 'Shooting',
      component: '/workflow/shooting/index',
      meta: {
        title: '拍摄管理',
        icon: 'ri:camera-line',
        keepAlive: false
      }
    },
    {
      path: 'publish',
      name: 'Publish',
      component: '/workflow/publish/index',
      meta: {
        title: '发布管理',
        icon: 'ri:send-plane-line',
        keepAlive: false
      }
    }
  ]
}
