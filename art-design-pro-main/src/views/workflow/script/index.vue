<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">剧本管理</h3>
        <div class="flex gap-2">
          <el-select v-model="filterStatus" placeholder="筛选状态" clearable style="width: 130px" @change="loadData">
            <el-option v-for="s in statuses" :key="s" :label="s" :value="s" />
          </el-select>
          <el-button type="primary" @click="handleAdd">新增剧本</el-button>
        </div>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="title" label="剧本标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="scriptType" label="类型" min-width="90" />
        <el-table-column prop="author" label="编剧" min-width="90" />
        <el-table-column prop="performer" label="出镜" min-width="90" />
        <el-table-column prop="cameraMan" label="摄影师" min-width="90" />
        <el-table-column prop="status" label="状态" min-width="80">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="platformTarget" label="目标平台" min-width="120" show-overflow-tooltip />
        <el-table-column prop="estimatedDuration" label="预估时长" min-width="90" />
        <el-table-column prop="createTime" label="创建时间" min-width="160">
          <template #default="{ row }">{{ formatDate(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex gap-2" v-if="selectedIds.length > 0">
        <el-button type="danger" @click="handleBatchDelete">批量删除 ({{ selectedIds.length }})</el-button>
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑剧本' : '新增剧本'" width="600px">
      <el-form :model="formData" label-width="90px">
        <el-form-item label="剧本标题">
          <el-input v-model="formData.title" placeholder="输入剧本标题" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="formData.scriptType" style="width: 100%">
            <el-option label="短视频" value="短视频" />
            <el-option label="直播脚本" value="直播脚本" />
            <el-option label="图文脚本" value="图文脚本" />
            <el-option label="软文" value="软文" />
          </el-select>
        </el-form-item>
        <el-form-item label="编剧">
          <el-input v-model="formData.author" placeholder="输入编剧姓名" />
        </el-form-item>
        <el-form-item label="出镜人">
          <el-input v-model="formData.performer" placeholder="输入出镜人" />
        </el-form-item>
        <el-form-item label="摄影师">
          <el-input v-model="formData.cameraMan" placeholder="输入摄影师" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option v-for="s in statuses" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标平台">
          <el-input v-model="formData.platformTarget" placeholder="如 抖音、快手、视频号" />
        </el-form-item>
        <el-form-item label="预估时长">
          <el-input v-model="formData.estimatedDuration" placeholder="如 30s、1min" />
        </el-form-item>
        <el-form-item label="剧本内容">
          <el-input v-model="formData.content" type="textarea" :rows="4" placeholder="输入剧本内容" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.notes" type="textarea" :rows="2" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchScriptList,
  fetchAddScript,
  fetchUpdateScript,
  fetchDeleteScript,
  fetchBatchDeleteScript
} from '@/api/script'

const statuses = ['草稿', '审核中', '已通过', '已驳回', '已拍摄']

const loading = ref(false)
const tableData = ref<any[]>([])
const filterStatus = ref('')
const selectedIds = ref<number[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formData = ref({
  title: '',
  content: '',
  scriptType: '短视频',
  author: '',
  performer: '',
  cameraMan: '',
  status: '草稿',
  platformTarget: '',
  estimatedDuration: '',
  notes: ''
})

const statusTagType = (status: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' | undefined => {
  const map: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = { '草稿': 'info', '审核中': 'warning', '已通过': 'success', '已驳回': 'danger' }
  return map[status]
}

const formatDate = (date: string) => (date ? new Date(date).toLocaleString('zh-CN') : '')

const loadData = async () => {
  loading.value = true
  try { const res: any = await fetchScriptList(filterStatus.value || undefined); tableData.value = res || [] } catch (e) { console.error(e) }
  loading.value = false
}

const handleSelectionChange = (rows: any[]) => { selectedIds.value = rows.map((r) => r.id) }

const handleAdd = () => {
  isEdit.value = false; editId.value = 0
  formData.value = { title: '', content: '', scriptType: '短视频', author: '', performer: '', cameraMan: '', status: '草稿', platformTarget: '', estimatedDuration: '', notes: '' }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true; editId.value = row.id
  formData.value = { title: row.title || '', content: row.content || '', scriptType: row.scriptType || '短视频', author: row.author || '', performer: row.performer || '', cameraMan: row.cameraMan || '', status: row.status || '草稿', platformTarget: row.platformTarget || '', estimatedDuration: row.estimatedDuration || '', notes: row.notes || '' }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) { await fetchUpdateScript(editId.value, formData.value); ElMessage.success('更新成功') }
    else { await fetchAddScript(formData.value); ElMessage.success('添加成功') }
    dialogVisible.value = false; loadData()
  } catch (e) { console.error(e) }
}

const handleDelete = async (id: number) => {
  try { await fetchDeleteScript(id); ElMessage.success('删除成功'); loadData() } catch (e) { console.error(e) }
}

const handleBatchDelete = async () => {
  try { await fetchBatchDeleteScript(selectedIds.value); ElMessage.success('批量删除成功'); selectedIds.value = []; loadData() } catch (e) { console.error(e) }
}

onMounted(() => { loadData() })
</script>

<style scoped lang="scss">
.page-container { padding: 16px; }
</style>
