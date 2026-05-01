import request from '@/utils/http'

export function fetchTodoList() {
  return request.get({ url: '/api/todo/list' })
}

export function createTodo(data: { content: string; priority: string; assignee: string; createdBy: string }) {
  return request.post({ url: '/api/todo/add', data })
}

export function updateTodo(id: number, data: { content?: string; priority?: string; assignee?: string; completed?: boolean }) {
  return request.put({ url: `/api/todo/${id}`, data })
}

export function toggleTodo(id: number) {
  return request.put({ url: `/api/todo/${id}/toggle` })
}

export function deleteTodo(id: number) {
  return request.del({ url: `/api/todo/${id}` })
}
