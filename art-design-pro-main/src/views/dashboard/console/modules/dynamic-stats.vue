<template>
  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>数据录入动态</h4>
        <p>今日新增<span class="text-success">+{{ recordList.length }}</span>条记录</p>
      </div>
    </div>

    <div class="h-9/10 mt-2 overflow-hidden">
      <ElScrollbar>
        <div
          class="h-17.5 leading-17.5 border-b border-g-300 text-sm overflow-hidden last:border-b-0"
          v-for="(item, index) in recordList"
          :key="index"
        >
          <span class="text-g-800 font-medium">{{ item.username }}</span>
          <span class="mx-2 text-g-600">{{ item.action }}</span>
          <span class="text-theme">{{ item.target }}</span>
          <span class="text-g-500 text-xs ml-2">({{ item.time }})</span>
        </div>
      </ElScrollbar>
    </div>
  </div>

  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>待办事项</h4>
        <p>待处理<span class="text-danger">{{ pendingCount }}</span>项</p>
      </div>
      <ElButton type="primary" size="small" @click="openAddDialog">
        <template #icon><ElIcon><Plus /></ElIcon></template>
        新增
      </ElButton>
    </div>

    <div class="h-9/10 mt-2 overflow-hidden">
      <ElScrollbar>
        <div
          class="flex items-center justify-between py-2 border-b border-g-300 text-sm last:border-b-0"
          v-for="(item, index) in todoList"
          :key="index"
        >
          <div class="flex items-center flex-1 min-w-0">
            <ElCheckbox
              :model-value="item.completed"
              @change="(val: boolean) => handleToggle(item.id, val)"
            />
            <div class="ml-2 min-w-0 flex-1">
              <div class="flex items-center">
                <span :class="item.completed ? 'text-g-500 line-through' : 'text-g-800'" class="truncate">
                  {{ item.content }}
                </span>
                <ElTag v-if="item.priority" size="small" :type="getPriorityType(item.priority)" class="ml-2 flex-shrink-0">
                  {{ getPriorityText(item.priority) }}
                </ElTag>
              </div>
              <div class="text-xs text-g-400 mt-0.5">
                <span>{{ item.createdAt }}</span>
                <span v-if="item.assignee" class="ml-2">负责人: {{ item.assignee }}</span>
                <span v-if="item.createdBy" class="ml-2">添加人: {{ item.createdBy }}</span>
              </div>
            </div>
          </div>
          <div class="flex gap-1 flex-shrink-0 ml-2">
            <ElButton link type="primary" size="small" @click="handleEdit(item)">编辑</ElButton>
            <ElPopconfirm title="确定删除?" @confirm="handleDelete(item.id)">
              <ElButton link type="danger" size="small">删除</ElButton>
            </ElPopconfirm>
          </div>
        </div>
      </ElScrollbar>
    </div>
  </div>

  <ElDialog
    v-model="showAddDialog"
    :title="editingTodo ? '编辑待办' : '新增待办'"
    width="500px"
    destroy-on-close
  >
    <ElForm :model="todoForm" label-width="80px">
      <ElFormItem label="内容">
        <ElInput v-model="todoForm.content" type="textarea" :rows="3" placeholder="请输入待办内容" />
      </ElFormItem>
      <ElFormItem label="优先级">
        <ElSelect v-model="todoForm.priority" placeholder="选择优先级">
          <ElOption label="低" value="low" />
          <ElOption label="中" value="medium" />
          <ElOption label="高" value="high" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="负责人">
        <ElInput v-model="todoForm.assignee" placeholder="请输入负责人姓名" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="showAddDialog = false">取消</ElButton>
      <ElButton type="primary" @click="handleSave">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { fetchActivityRecent } from '@/api/activity'
import { fetchTodoList, createTodo, updateTodo, toggleTodo as apiToggleTodo, deleteTodo } from '@/api/todo'
import { useUserStore } from '@/store/modules/user'
import { onMounted, ref, reactive, computed } from 'vue'

interface RecordItem {
  id: number
  username: string
  action: string
  target: string
  time: string
}

interface TodoItem {
  id: number
  content: string
  priority: string
  completed: boolean
  createdAt: string
  assignee: string
  createdBy: string
}

const recordList = reactive<RecordItem[]>([])

const loadRecords = async () => {
  try {
    const data: any = await fetchActivityRecent()
    recordList.length = 0
    data.forEach((item: any) => {
      const dt = new Date(item.createTime)
      const dateStr = `${dt.getMonth() + 1}/${dt.getDate()}`
      const timeStr = dt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      recordList.push({
        id: item.id,
        username: item.staffName,
        action: item.action,
        target: item.target,
        time: `${dateStr} ${timeStr}`,
      })
    })
  } catch (err) {
    console.error('加载动态记录失败', err)
  }
}

const todoList = reactive<TodoItem[]>([])

const loadTodos = async () => {
  try {
    const data: any = await fetchTodoList()
    todoList.length = 0
    data.forEach((item: any) => {
      const dt = new Date(item.createTime)
      const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
      todoList.push({
        id: item.id,
        content: item.content,
        priority: item.priority,
        completed: item.completed,
        createdAt: dateStr,
        assignee: item.assignee || '',
        createdBy: item.createdBy || '',
      })
    })
  } catch (err) {
    console.error('加载待办事项失败', err)
  }
}

const pendingCount = computed(() => todoList.filter(item => !item.completed).length)

onMounted(() => {
  loadRecords()
  loadTodos()
})

const showAddDialog = ref(false)
const editingTodo = ref<TodoItem | null>(null)
const todoForm = ref({
  content: '',
  priority: 'low',
  assignee: ''
})

const getPriorityType = (priority: string) => {
  switch (priority) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'info'
    default: return ''
  }
}

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
    default: return ''
  }
}

const openAddDialog = () => {
  editingTodo.value = null
  todoForm.value = { content: '', priority: 'low', assignee: '' }
  showAddDialog.value = true
}

const handleEdit = (item: TodoItem) => {
  editingTodo.value = item
  todoForm.value = { content: item.content, priority: item.priority, assignee: item.assignee || '' }
  showAddDialog.value = true
}

const handleDelete = async (id: number) => {
  try {
    await deleteTodo(id)
    await loadTodos()
  } catch (err) {
    console.error('删除待办失败', err)
  }
}

const handleSave = async () => {
  if (!todoForm.value.content.trim()) return

  try {
    const userStore = useUserStore()
    const username = userStore.info?.userName || ''

    if (editingTodo.value) {
      await updateTodo(editingTodo.value.id, {
        content: todoForm.value.content,
        priority: todoForm.value.priority,
        assignee: todoForm.value.assignee,
      })
    } else {
      await createTodo({
        content: todoForm.value.content,
        priority: todoForm.value.priority,
        assignee: todoForm.value.assignee,
        createdBy: username,
      })
    }

    showAddDialog.value = false
    editingTodo.value = null
    todoForm.value = { content: '', priority: 'low', assignee: '' }
    await loadTodos()
  } catch (err) {
    console.error('保存待办失败', err)
  }
}

const handleToggle = async (id: number, val: boolean) => {
  try {
    await apiToggleTodo(id)
    const todo = todoList.find(item => item.id === id)
    if (todo) {
      todo.completed = val
    }
  } catch (err) {
    console.error('切换待办状态失败', err)
    const todo = todoList.find(item => item.id === id)
    if (todo) {
      todo.completed = !val
    }
  }
}
</script>
