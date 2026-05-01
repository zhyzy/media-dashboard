import request from '@/utils/http'

const BASE = '/api'

export function fetchExpenseList(department?: string, category?: string) {
  return request.get({
    url: `${BASE}/expense/list`,
    params: { ...(department ? { department } : {}), ...(category ? { category } : {}) }
  })
}

export function fetchExpenseSummary() {
  return request.get({ url: `${BASE}/expense/summary` })
}

export function fetchAddExpense(data: any) {
  return request.post({ url: `${BASE}/expense/add`, data: data })
}

export function fetchUpdateExpense(id: number, data: any) {
  return request.put({ url: `${BASE}/expense/${id}`, data: data })
}

export function fetchDeleteExpense(id: number) {
  return request.del({ url: `${BASE}/expense/${id}` })
}

export function fetchBatchDeleteExpense(ids: number[]) {
  return request.del({ url: `${BASE}/expense/batch`, data: { ids } })
}
