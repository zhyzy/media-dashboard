<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">DataEase 数据源管理</h3>
        <el-button type="primary" @click="handleCreateKey">生成新密钥</el-button>
      </div>

      <el-table :data="keyList" border stripe v-loading="loading">
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column prop="apiKey" label="API Key" min-width="280">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <code class="text-xs bg-gray-100 px-2 py-1 rounded">{{ row.apiKey }}</code>
              <el-button link type="primary" size="small" @click="copyKey(row.apiKey)">复制</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" min-width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160">
          <template #default="{ row }">{{ formatDate(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-button link type="success" @click="handleTest(row)">测试</el-button>
            <el-button link type="primary" @click="handleToggle(row)">{{ row.isActive ? '禁用' : '启用' }}</el-button>
            <el-popconfirm title="确认删除？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="mt-4">
      <h3 class="text-lg font-bold mb-4">接口说明</h3>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="抖音数据">GET /api/dataease/datasource/douyin?api_key=xxx</el-descriptions-item>
        <el-descriptions-item label="快手数据">GET /api/dataease/datasource/kuaishou?api_key=xxx</el-descriptions-item>
        <el-descriptions-item label="视频号数据">GET /api/dataease/datasource/video-account?api_key=xxx</el-descriptions-item>
        <el-descriptions-item label="直播数据">GET /api/dataease/datasource/live?api_key=xxx</el-descriptions-item>
        <el-descriptions-item label="自媒体数据">GET /api/dataease/datasource/media?api_key=xxx</el-descriptions-item>
        <el-descriptions-item label="短视频合并">GET /api/dataease/datasource/short-video?api_key=xxx</el-descriptions-item>
        <el-descriptions-item label="汇总数据">GET /api/dataease/datasource/summary?api_key=xxx</el-descriptions-item>
        <el-descriptions-item label="全平台总览">GET /api/dataease/datasource/overview?api_key=xxx</el-descriptions-item>
        <el-descriptions-item label="全部数据">GET /api/dataease/datasource/all?api_key=xxx</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-dialog v-model="testDialogVisible" title="接口测试" width="700px" destroy-on-close>
      <div class="mb-4">
        <el-select v-model="selectedApi" placeholder="选择要测试的接口" style="width: 100%;">
          <el-option label="抖音数据" value="douyin" />
          <el-option label="快手数据" value="kuaishou" />
          <el-option label="视频号数据" value="video-account" />
          <el-option label="直播数据" value="live" />
          <el-option label="自媒体数据" value="media" />
          <el-option label="短视频合并" value="short-video" />
          <el-option label="汇总数据" value="summary" />
          <el-option label="全平台总览" value="overview" />
          <el-option label="全部数据" value="all" />
        </el-select>
      </div>
      <div class="mb-4">
        <div class="flex gap-2">
          <el-input v-model="testUrl" readonly placeholder="测试地址" />
          <el-button type="primary" @click="handleExecuteTest" :loading="testLoading">执行测试</el-button>
        </div>
      </div>
      <div v-if="testResult">
        <div class="mb-2 flex items-center gap-2">
          <strong>测试结果：</strong>
          <el-tag :type="testResult.success ? 'success' : 'danger'" size="small">
            {{ testResult.success ? '成功' : '失败' }}
          </el-tag>
          <span class="text-sm text-gray-500">耗时：{{ testResult.duration }}ms</span>
        </div>
        <div class="border rounded p-3 bg-gray-50 max-h-96 overflow-auto">
          <pre class="text-xs whitespace-pre-wrap">{{ JSON.stringify(testResult.data, null, 2) }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button @click="testDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchDataeaseKeys,
  fetchCreateDataeaseKey,
  fetchDeleteDataeaseKey,
  fetchToggleDataeaseKey
} from '@/api/dataease'
import request from '@/utils/http'

const loading = ref(false)
const keyList = ref<any[]>([])
const testDialogVisible = ref(false)
const selectedApiKey = ref('')
const selectedApi = ref('douyin')
const testLoading = ref(false)
const testResult = ref<any>(null)

const testUrl = computed(() => {
  if (!selectedApiKey.value || !selectedApi.value) return ''
  return `/api/dataease/datasource/${selectedApi.value}?api_key=${selectedApiKey.value}`
})

const formatDate = (date: string) => (date ? new Date(date).toLocaleString('zh-CN') : '')

const loadData = async () => {
  loading.value = true
  try { const res: any = await fetchDataeaseKeys(); keyList.value = res || [] } catch (e) { console.error(e) }
  loading.value = false
}

const handleCreateKey = async () => {
  try {
    await fetchCreateDataeaseKey('数据源密钥')
    ElMessage.success('密钥生成成功')
    loadData()
  } catch (e) { console.error(e) }
}

const handleToggle = async (row: any) => {
  try {
    await fetchToggleDataeaseKey(row.id)
    ElMessage.success('状态已更新')
    loadData()
  } catch (e) { console.error(e) }
}

const handleDelete = async (id: number) => {
  try { await fetchDeleteDataeaseKey(id); ElMessage.success('删除成功'); loadData() } catch (e) { console.error(e) }
}

const copyKey = (key: string) => {
  navigator.clipboard.writeText(key)
  ElMessage.success('已复制到剪贴板')
}

const handleTest = (row: any) => {
  if (!row.isActive) {
    ElMessage.warning('请先启用该密钥')
    return
  }
  selectedApiKey.value = row.apiKey
  testResult.value = null
  testDialogVisible.value = true
}

const handleExecuteTest = async () => {
  if (!selectedApiKey.value || !selectedApi.value) {
    ElMessage.warning('请选择要测试的接口')
    return
  }
  testLoading.value = true
  testResult.value = null
  const startTime = Date.now()
  try {
    const testFullUrl = `/api/dataease/datasource/${selectedApi.value}?api_key=${selectedApiKey.value}`
    const response = await fetch(testFullUrl, { method: 'GET', headers: { 'Accept': 'application/json' } })
    const duration = Date.now() - startTime

    if (!response.ok) {
      const errorText = await response.text()
      testResult.value = {
        success: false,
        duration,
        data: { status: response.status, statusText: response.statusText, error: errorText }
      }
      ElMessage.error('接口测试失败，请查看详情')
      return
    }

    const data = await response.json()
    testResult.value = {
      success: true,
      duration,
      data
    }
    ElMessage.success('接口测试成功！')
  } catch (e: any) {
    const duration = Date.now() - startTime
    testResult.value = {
      success: false,
      duration,
      data: e?.message || '请求失败'
    }
    ElMessage.error('接口测试失败，请查看详情')
  }
  testLoading.value = false
}

onMounted(() => { loadData() })
</script>

<style scoped lang="scss">
.page-container { padding: 16px; }
</style>
