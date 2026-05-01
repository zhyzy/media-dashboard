import { AppRouteRecord } from '@/types/router'

export const dataRoutes: AppRouteRecord = {
  path: '/data',
  name: 'Data',
  component: '/index/index',
  meta: {
    title: '数据管理',
    icon: 'ri:bar-chart-2-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'douyin',
      name: 'DouyinData',
      component: '/data/douyin/index',
      meta: {
        title: '抖音数据',
        icon: 'ri:music-2-line',
        keepAlive: false
      }
    },
    {
      path: 'kuaishou',
      name: 'KuaishouData',
      component: '/data/kuaishou/index',
      meta: {
        title: '快手数据',
        icon: 'ri:video-line',
        keepAlive: false
      }
    },
    {
      path: 'video-account',
      name: 'VideoAccountData',
      component: '/data/video-account/index',
      meta: {
        title: '视频号数据',
        icon: 'ri:vidicon-line',
        keepAlive: false
      }
    },
    {
      path: 'live',
      name: 'LiveData',
      component: '/data/live/index',
      meta: {
        title: '直播数据',
        icon: 'ri:live-line',
        keepAlive: false
      }
    },
    {
      path: 'media',
      name: 'MediaData',
      component: '/data/media/index',
      meta: {
        title: '自媒体数据',
        icon: 'ri:article-line',
        keepAlive: false
      }
    },
    {
      path: 'dataease',
      name: 'DataeaseConfig',
      component: '/data/dataease/index',
      meta: {
        title: '数据源管理',
        icon: 'ri:database-2-line',
        keepAlive: false
      }
    }
  ]
}
