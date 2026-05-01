import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/',
    component: () => import('../layout/AdminLayout.vue'),
    redirect: '/douyin',
    children: [
      {
        path: 'douyin',
        name: 'DouyinList',
        component: () => import('../views/douyin/DouyinList.vue'),
        meta: { title: '抖音数据' },
      },
      {
        path: 'douyin/add',
        name: 'DouyinAdd',
        component: () => import('../views/douyin/DouyinAdd.vue'),
        meta: { title: '新增抖音数据' },
      },
      {
        path: 'kuaishou',
        name: 'KuaishouList',
        component: () => import('../views/kuaishou/KuaishouList.vue'),
        meta: { title: '快手数据' },
      },
      {
        path: 'kuaishou/add',
        name: 'KuaishouAdd',
        component: () => import('../views/kuaishou/KuaishouAdd.vue'),
        meta: { title: '新增快手数据' },
      },
      {
        path: 'media',
        name: 'MediaList',
        component: () => import('../views/media/MediaList.vue'),
        meta: { title: '自媒体数据' },
      },
      {
        path: 'media/add',
        name: 'MediaAdd',
        component: () => import('../views/media/MediaAdd.vue'),
        meta: { title: '新增自媒体数据' },
      },
      {
        path: 'dataease',
        name: 'DataeaseConfig',
        component: () => import('../views/dataease/DataeaseConfig.vue'),
        meta: { title: 'DataEase数据源' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
