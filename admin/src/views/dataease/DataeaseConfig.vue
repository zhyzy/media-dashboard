<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2 style="margin: 0">DataEase 数据源管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">生成新 API Key</el-button>
    </div>

    <el-alert
      title="DataEase 对接说明"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 20px"
    >
      <template #default>
        <div style="line-height: 1.8; font-size: 13px">
          <p style="margin: 0 0 4px">1. 在 DataEase 中选择「API 数据源」类型</p>
          <p style="margin: 0 0 4px">2. 填入下方接口地址，请求头添加 <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px">x-api-key: 你的API Key</code></p>
          <p style="margin: 0 0 4px">3. 可用数据表：<strong>douyin</strong>（抖音）、<strong>kuaishou</strong>（快手）、<strong>media</strong>（自媒体）、<strong>summary</strong>（汇总）、<strong>all</strong>（全部合并）</p>
          <p style="margin: 0">4. 数据会随后台录入实时更新，DataEase 刷新即可获取最新数据</p>
        </div>
      </template>
    </el-alert>

    <el-table :data="keyList" v-loading="loading" border stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名称" width="160" />
      <el-table-column label="API Key" min-width="300">
        <template #default="{ row }">
          <div style="display: flex; align-items: center; gap: 8px">
            <code style="flex: 1; font-size: 12px; background: #f5f7fa; padding: 4px 8px; border-radius: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
              {{ row.apiKey }}
            </code>
            <el-button size="small" @click="copyKey(row.apiKey)">复制</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">
            {{ row.isActive ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="{ row }">
          {{ (row.createTime || '').replace('T', ' ').slice(0, 19) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" :type="row.isActive ? 'warning' : 'success'" @click="handleToggle(row)">
            {{ row.isActive ? '禁用' : '启用' }}
          </el-button>
          <el-button size="small" type="primary" @click="handleTest(row)">测试</el-button>
          <el-popconfirm title="确定删除此API Key？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showCreateDialog" title="生成 API Key" width="450px" destroy-on-close>
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="createForm.name" placeholder="如：DataEase生产环境" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreate">生成</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showTestDialog" title="接口测试" width="700px" destroy-on-close>
      <div style="margin-bottom: 16px">
        <el-select v-model="testTable" style="width: 200px; margin-right: 10px">
          <el-option label="全平台总览" value="overview" />
          <el-option label="抖音数据" value="douyin" />
          <el-option label="快手数据" value="kuaishou" />
          <el-option label="自媒体数据" value="media" />
          <el-option label="汇总数据" value="summary" />
          <el-option label="全部合并" value="all" />
        </el-select>
        <el-button type="primary" :loading="testLoading" @click="runTest">发送测试请求</el-button>
      </div>

      <div v-if="testResult !== null" style="margin-bottom: 12px">
        <div style="margin-bottom: 8px; font-size: 13px; color: #666">
          请求地址：<code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px">{{ testUrl }}</code>
        </div>
        <div style="margin-bottom: 8px; font-size: 13px; color: #666">
          请求头：<code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px">x-api-key: {{ testApiKey }}</code>
        </div>
        <el-tag :type="testSuccess ? 'success' : 'danger'" size="small" style="margin-bottom: 8px">
          {{ testSuccess ? '连接成功' : '连接失败' }}
        </el-tag>
      </div>

      <el-input
        v-if="testResult !== null"
        type="textarea"
        :model-value="testResult"
        :rows="12"
        readonly
        style="font-family: monospace"
      />
    </el-dialog>

    <el-card style="margin-top: 24px">
      <template #header>
        <span style="font-weight: bold">接口文档</span>
      </template>
      <el-table :data="apiDocs" border size="small" style="width: 100%">
        <el-table-column prop="method" label="方法" width="80">
          <template #default="{ row }">
            <el-tag :type="row.method === 'GET' ? 'primary' : 'success'" size="small">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="接口路径" min-width="280">
          <template #default="{ row }">
            <code style="font-size: 12px">{{ row.path }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="200" />
        <el-table-column prop="params" label="参数" min-width="180">
          <template #default="{ row }">
            <span style="font-size: 12px; color: #999">{{ row.params }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDataeaseKeys, createDataeaseKey, deleteDataeaseKey, toggleDataeaseKey, testDataeaseConnection } from '../../api'
import { ElMessage } from 'element-plus'

const baseUrl = window.location.origin + '/api'

const keyList = ref([])
const loading = ref(false)
const showCreateDialog = ref(false)
const createLoading = ref(false)
const createForm = ref({ name: '' })

const showTestDialog = ref(false)
const testTable = ref('douyin')
const testApiKey = ref('')
const testLoading = ref(false)
const testResult = ref(null)
const testSuccess = ref(false)

const testUrl = computed(() => `${baseUrl}/dataease/datasource/${testTable.value}`)

const apiDocs = [
  { method: 'GET', path: '/api/dataease/datasource/overview', description: '全平台总览（推荐）', params: '无' },
  { method: 'GET', path: '/api/dataease/datasource/douyin', description: '获取抖音数据列表', params: 'date (可选，格式 YYYY-MM-DD)' },
  { method: 'GET', path: '/api/dataease/datasource/kuaishou', description: '获取快手数据列表', params: 'date (可选，格式 YYYY-MM-DD)' },
  { method: 'GET', path: '/api/dataease/datasource/media', description: '获取自媒体数据列表', params: 'platform (可选，如 知乎)' },
  { method: 'GET', path: '/api/dataease/datasource/summary', description: '获取汇总统计数据', params: '无' },
  { method: 'GET', path: '/api/dataease/datasource/all', description: '获取全部数据合并表', params: '无' },
  { method: 'GET', path: '/api/dataease/datasource/tables', description: '获取可用数据表列表', params: '无' },
]

async function fetchKeys() {
  loading.value = true
  try {
    keyList.value = await getDataeaseKeys()
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  createLoading.value = true
  try {
    await createDataeaseKey({ name: createForm.value.name })
    ElMessage.success('API Key 生成成功')
    showCreateDialog.value = false
    createForm.value.name = ''
    fetchKeys()
  } finally {
    createLoading.value = false
  }
}

async function handleDelete(id) {
  await deleteDataeaseKey(id)
  ElMessage.success('删除成功')
  fetchKeys()
}

async function handleToggle(row) {
  await toggleDataeaseKey(row.id)
  ElMessage.success(row.isActive ? '已禁用' : '已启用')
  fetchKeys()
}

function handleTest(row) {
  testApiKey.value = row.apiKey
  testTable.value = 'douyin'
  testResult.value = null
  showTestDialog.value = true
}

async function runTest() {
  testLoading.value = true
  testResult.value = null
  try {
    const res = await testDataeaseConnection(testApiKey.value, testTable.value)
    testResult.value = JSON.stringify(res, null, 2)
    testSuccess.value = true
  } catch (e) {
    testResult.value = e.response?.data?.message || e.message || '请求失败'
    testSuccess.value = false
  } finally {
    testLoading.value = false
  }
}

function copyKey(key) {
  navigator.clipboard.writeText(key).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    const textarea = document.createElement('textarea')
    textarea.value = key
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('已复制到剪贴板')
  })
}

onMounted(fetchKeys)
</script>
