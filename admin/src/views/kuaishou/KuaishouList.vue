<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2 style="margin: 0">快手数据列表</h2>
      <div>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量删除 ({{ selectedIds.length }})
        </el-button>
        <el-button type="primary" @click="$router.push('/kuaishou/add')">新增数据</el-button>
      </div>
    </div>

    <el-table
      :data="pagedList"
      v-loading="loading"
      border
      stripe
      @selection-change="handleSelectionChange"
      style="width: 100%"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="曝光量" width="160">
        <template #default="{ row }">
          <span style="font-weight: 600; color: #e6a23c">{{ row.exposure?.toLocaleString() }}</span>
          <span v-if="row.exposureDiff !== undefined" :class="row.exposureDiff >= 0 ? 'diff-up' : 'diff-down'" style="margin-left: 6px; font-size: 12px">
            {{ row.exposureDiff >= 0 ? '+' : '' }}{{ row.exposureDiff?.toLocaleString() }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="观看人数" width="150">
        <template #default="{ row }">
          <span>{{ row.viewers?.toLocaleString() }}</span>
          <span v-if="row.viewersDiff !== undefined" :class="row.viewersDiff >= 0 ? 'diff-up' : 'diff-down'" style="margin-left: 6px; font-size: 12px">
            {{ row.viewersDiff >= 0 ? '+' : '' }}{{ row.viewersDiff?.toLocaleString() }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="停留时长" width="120" />
      <el-table-column prop="createTime" label="日期" width="120">
        <template #default="{ row }">
          {{ (row.createTime || '').split('T')[0] }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button type="danger" size="small" link>删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div style="display: flex; justify-content: flex-end; margin-top: 16px">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="processedList.length"
        layout="total, sizes, prev, pager, next"
      />
    </div>

    <el-dialog v-model="editDialogVisible" title="编辑快手数据" width="500px" destroy-on-close>
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="曝光量">
          <el-input-number v-model="editForm.exposure" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="观看人数">
          <el-input-number v-model="editForm.viewers" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="停留时长">
          <el-input v-model="editForm.duration" placeholder="如 30min" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleUpdate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getKuaishouList, updateKuaishou, deleteKuaishou, batchDeleteKuaishou } from '../../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([])
const loading = ref(false)
const selectedIds = ref([])
const currentPage = ref(1)
const pageSize = ref(20)

const editDialogVisible = ref(false)
const editLoading = ref(false)
const editForm = ref({})

const processedList = computed(() => {
  const sorted = [...list.value].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))

  return sorted.map((item, index) => {
    const row = { ...item }
    if (index < sorted.length - 1) {
      const prev = sorted[index + 1]
      row.exposureDiff = item.exposure - prev.exposure
      row.viewersDiff = item.viewers - prev.viewers
    }
    return row
  })
})

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return processedList.value.slice(start, start + pageSize.value)
})

async function fetchList() {
  loading.value = true
  try {
    list.value = await getKuaishouList()
  } finally {
    loading.value = false
  }
}

function handleSelectionChange(rows) {
  selectedIds.value = rows.map((r) => r.id)
}

async function handleBatchDelete() {
  await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条数据？`, '批量删除', { type: 'warning' })
  await batchDeleteKuaishou(selectedIds.value)
  ElMessage.success('批量删除成功')
  fetchList()
}

async function handleDelete(id) {
  await deleteKuaishou(id)
  ElMessage.success('删除成功')
  fetchList()
}

function handleEdit(row) {
  editForm.value = {
    id: row.id,
    exposure: row.exposure,
    viewers: row.viewers,
    duration: row.duration,
  }
  editDialogVisible.value = true
}

async function handleUpdate() {
  editLoading.value = true
  try {
    const { id, exposure, viewers, duration } = editForm.value
    await updateKuaishou(id, { exposure, viewers, duration })
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    fetchList()
  } finally {
    editLoading.value = false
  }
}

onMounted(fetchList)
</script>

<style scoped>
.diff-up { color: #67c23a; }
.diff-down { color: #f56c6c; }
</style>
