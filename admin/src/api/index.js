import request from '../utils/request'

export const login = (data) => request.post('/auth/login', data)

export const getDouyinList = () => request.get('/douyin/list')
export const addDouyin = (data) => request.post('/douyin/add', data)
export const updateDouyin = (id, data) => request.put(`/douyin/${id}`, data)
export const deleteDouyin = (id) => request.delete(`/douyin/${id}`)
export const batchDeleteDouyin = (ids) => request.delete('/douyin/batch', { data: { ids } })
export const getDouyinAccounts = () => request.get('/douyin/accounts')

export const getKuaishouList = () => request.get('/kuaishou/list')
export const addKuaishou = (data) => request.post('/kuaishou/add', data)
export const updateKuaishou = (id, data) => request.put(`/kuaishou/${id}`, data)
export const deleteKuaishou = (id) => request.delete(`/kuaishou/${id}`)
export const batchDeleteKuaishou = (ids) => request.delete('/kuaishou/batch', { data: { ids } })

export const getMediaList = (params) => request.get('/media/list', { params })
export const addMedia = (data) => request.post('/media/add', data)
export const updateMedia = (id, data) => request.put(`/media/${id}`, data)
export const deleteMedia = (id) => request.delete(`/media/${id}`)
export const batchDeleteMedia = (ids) => request.delete('/media/batch', { data: { ids } })

export const getDashboardSummary = () => request.get('/dashboard/summary')
export const getDashboardTrend = (days) => request.get('/dashboard/trend', { params: { days } })
export const getDashboardRankings = () => request.get('/dashboard/rankings')

export const getDataeaseKeys = () => request.get('/dataease/keys')
export const createDataeaseKey = (data) => request.post('/dataease/keys', data)
export const deleteDataeaseKey = (id) => request.delete(`/dataease/keys/${id}`)
export const toggleDataeaseKey = (id) => request.post(`/dataease/keys/${id}/toggle`)
export const testDataeaseConnection = (apiKey, table) => request.get(`/dataease/datasource/${table}`, { headers: { 'x-api-key': apiKey } })
