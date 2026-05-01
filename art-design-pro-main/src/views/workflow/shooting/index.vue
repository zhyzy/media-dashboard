<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">拍摄管理</h3>
        <div class="flex gap-2">
          <el-select v-model="filterStatus" placeholder="筛选状态" clearable style="width: 130px" @change="loadData">
            <el-option v-for="s in statuses" :key="s" :label="s" :value="s" />
          </el-select>
          <el-button type="primary" @click="handleAdd">新增拍摄</el-button>
        </div>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="title" label="拍摄主题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="shootingDate" label="拍摄日期" min-width="110" />
        <el-table-column prop="shootingLocation" label="拍摄地点" min-width="140" show-overflow-tooltip />
        <el-table-column prop="cameraMan" label="摄影师" min-width="90" />
        <el-table-column prop="performer" label="出镜人" min-width="90" />
        <el-table-column prop="director" label="导演" min-width="90" />
        <el-table-column prop="status" label="状态" min-width="80">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="videoUrl" label="视频链接" min-width="120" show-overflow-tooltip />
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑拍摄' : '新增拍摄'" width="600px">
      <el-form :model="formData" label-width="90px">
        <el-form-item label="拍摄主题">
          <el-select v-model="formData.title" placeholder="选择剧本或自定义" clearable filterable allow-create style="width: 100%">
            <el-option v-for="s in scriptList" :key="s.id" :label="s.title" :value="s.title" />
          </el-select>
        </el-form-item>
        <el-form-item label="拍摄日期">
          <el-input v-model="formData.shootingDate" placeholder="如 2026-04-30" />
        </el-form-item>
        <el-form-item label="拍摄地点">
          <el-input v-model="formData.shootingLocation" placeholder="输入拍摄地点" />
        </el-form-item>
        <el-form-item label="摄影师">
          <el-input v-model="formData.cameraMan" placeholder="输入摄影师" />
        </el-form-item>
        <el-form-item label="出镜人">
          <el-input v-model="formData.performer" placeholder="输入出镜人" />
        </el-form-item>
        <el-form-item label="导演">
          <el-input v-model="formData.director" placeholder="输入导演" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option v-for="s in statuses" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="视频链接">
          <el-input v-model="formData.videoUrl" placeholder="输入视频链接" />
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
  fetchShootingList,
  fetchAddShooting,
  fetchUpdateShooting,
  fetchDeleteShooting,
  fetchBatchDeleteShooting
} from '@/api/shooting'
import { fetchScriptList } from '@/api/script'

const statuses = ['待拍摄', '拍摄中', '已完成', '已取消']

const loading = ref(false)
const tableData = ref<any[]>([])
const scriptList = ref<any[]>([])
const filterStatus = ref('')
const selectedIds = ref<number[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formData = ref({
  title: '',
  shootingDate: '',
  shootingLocation: '',
  cameraMan: '',
  performer: '',
  director: '',
  status: '待拍摄',
  videoUrl: '',
  notes: ''
})

const statusTagType = (status: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' | undefined => {
  const map: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = { '待拍摄': 'info', '拍摄中': 'warning', '已完成': 'success', '已取消': 'danger' }
  return map[status]
}

const formatDate = (date: string) => (date ? new Date(date).toLocaleString('zh-CN') : '')

const loadData = async () => {
  loading.value = true
  try { const res: any = await fetchShootingList(filterStatus.value || undefined); tableData.value = res || [] } catch (e) { console.error(e) }
  loading.value = false
}

const loadScripts = async () => {
  try { const res: any = await fetchScriptList(); scriptList.value = res || [] } catch (e) { console.error(e) }
}

const handleSelectionChange = (rows: any[]) => { selectedIds.value = rows.map((r) => r.id) }

const handleAdd = () => {
  isEdit.value = false; editId.value = 0
  formData.value = { title: '', shootingDate: '', shootingLocation: '', cameraMan: '', performer: '', director: '', status: '待拍摄', videoUrl: '', notes: '' }
  loadScripts()
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true; editId.value = row.id
  formData.value = { title: row.title || '', shootingDate: row.shootingDate || '', shootingLocation: row.shootingLocation || '', cameraMan: row.cameraMan || '', performer: row.performer || '', director: row.director || '', status: row.status || '待拍摄', videoUrl: row.videoUrl || '', notes: row.notes || '' }
  loadScripts()
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) { await fetchUpdateShooting(editId.value, formData.value); ElMessage.success('更新成功') }
    else { await fetchAddShooting(formData.value); ElMessage.success('添加成功') }
    dialogVisible.value = false; loadData()
  } catch (e) { console.error(e) }
}

const handleDelete = async (id: number) => {
  try { await fetchDeleteShooting(id); ElMessage.success('删除成功'); loadData() } catch (e) { console.error(e) }
}

const handleBatchDelete = async () => {
  try { await fetchBatchDeleteShooting(selectedIds.value); ElMessage.success('批量删除成功'); selectedIds.value = []; loadData() } catch (e) { console.error(e) }
}

onMounted(() => { loadData() })
</script>

<style scoped lang="scss">
.page-container { padding: 16px; }
</style>
