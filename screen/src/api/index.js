import request from '../utils/request'

export const getDashboardSummary = () => request.get('/dashboard/summary')
export const getDashboardTrend = (days = 7) => request.get('/dashboard/trend', { params: { days } })
export const getDashboardRankings = () => request.get('/dashboard/rankings')
export const getDouyinList = () => request.get('/douyin/list')
export const getKuaishouList = () => request.get('/kuaishou/list')
export const getMediaDistribution = () => request.get('/media/distribution')
export const getMediaList = (platform) => request.get('/media/list', { params: { platform } })
