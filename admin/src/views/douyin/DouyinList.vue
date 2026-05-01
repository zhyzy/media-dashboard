<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2 style="margin: 0">抖音数据列表</h2>
      <div>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量删除 ({{ selectedIds.length }})
        </el-button>
        <el-button type="primary" @click="$router.push('/douyin/add')">新增数据</el-button>
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
      <el-table-column prop="accountName" label="账号名称" width="180" />
      <el-table-column label="播放量" width="140">
        <template #default="{ row }">
          <span style="font-weight: 600; color: #409eff">{{ row.playCount?.toLocaleString() }}</span>
          <span v-if="row.playCountDiff !== undefined" :class="row.playCountDiff >= 0 ? 'diff-up' : 'diff-down'" style="margin-left: 6px; font-size: 12px">
            {{ row.playCountDiff >= 0 ? '+' : '' }}{{ row.playCountDiff?.toLocaleString() }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="点赞数" width="130">
        <template #default="{ row }">
          <span>{{ row.likeCount?.toLocaleString() }}</span>
          <span v-if="row.likeCountDiff !== undefined" :class="row.likeCountDiff >= 0 ? 'diff-up' : 'diff-down'" style="margin-left: 6px; font-size: 12px">
            {{ row.likeCountDiff >= 0 ? '+' : '' }}{{ row.likeCountDiff?.toLocaleString() }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="评论数" width="130">
        <template #default="{ row }">
          <span>{{ row.commentCount?.toLocaleString() }}</span>
          <span v-if="row.commentCountDiff !== undefined" :class="row.commentCountDiff >= 0 ? 'diff-up' : 'diff-down'" style="margin-left: 6px; font-size: 12px">
            {{ row.commentCountDiff >= 0 ? '+' : '' }}{{ row.commentCountDiff?.toLocaleString() }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="转发数" width="130">
        <template #default="{ row }">
          <span>{{ row.shareCount?.toLocaleString() }}</span>
          <span v-if="row.shareCountDiff !== undefined" :class="row.shareCountDiff >= 0 ? 'diff-up' : 'diff-down'" style="margin-left: 6px; font-size: 12px">
            {{ row.shareCountDiff >= 0 ? '+' : '' }}{{ row.shareCountDiff?.toLocaleString() }}
          </span>
        </template>
      </el-table-column>
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

    <el-dialog v-model="editDialogVisible" title="编辑抖音数据" width="500px" destroy-on-close>
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="账号名称">
          <el-input v-model="editForm.accountName" disabled />
        </el-form-item>
        <el-form-item label="播放量">
          <el-input-number v-model="editForm.playCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="点赞数">
          <el-input-number v-model="editForm.likeCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="评论数">
          <el-input-number v-model="editForm.commentCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="转发数">
          <el-input-number v-model="editForm.shareCount" :min="0" style="width: 100%" />
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
import { getDouyinList, updateDouyin, deleteDouyin, batchDeleteDouyin } from '../../api'
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
  const sorted = [...list.value].sort((a, b) => {
    if (a.accountName !== b.accountName) return a.accountName.localeCompare(b.accountName)
    return new Date(b.createTime) - new Date(a.createTime)
  })

  const accountLastData = {}
  sorted.forEach((item) => {
    if (!accountLastData[item.accountName]) {
      accountLastData[item.accountName] = item
    }
  })

  const result = []
  sorted.forEach((item) => {
    const dateStr = (item.createTime || '').split('T')[0]
    const yesterday = new Date(item.createTime)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const prevRecord = sorted.find(
      (r) => r.accountName === item.accountName && (r.createTime || '').split('T')[0] === yesterdayStr,
    )

    const row = { ...item }
    if (prevRecord) {
      row.playCountDiff = item.playCount - prevRecord.playCount
      row.likeCountDiff = item.likeCount - prevRecord.likeCount
      row.commentCountDiff = item.commentCount - prevRecord.commentCount
      row.shareCountDiff = item.shareCount - prevRecord.shareCount
    }
    result.push(row)
  })

  return result
})

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return processedList.value.slice(start, start + pageSize.value)
})

async function fetchList() {
  loading.value = true
  try {
    list.value = await getDouyinList()
  } finally {
    loading.value = false
  }
}

function handleSelectionChange(rows) {
  selectedIds.value = rows.map((r) => r.id)
}

async function handleBatchDelete() {
  await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条数据？`, '批量删除', { type: 'warning' })
  await batchDeleteDouyin(selectedIds.value)
  ElMessage.success('批量删除成功')
  fetchList()
}

async function handleDelete(id) {
  await deleteDouyin(id)
  ElMessage.success('删除成功')
  fetchList()
}

function handleEdit(row) {
  editForm.value = {
    id: row.id,
    accountName: row.accountName,
    playCount: row.playCount,
    likeCount: row.likeCount,
    commentCount: row.commentCount,
    shareCount: row.shareCount,
  }
  editDialogVisible.value = true
}

async function handleUpdate() {
  editLoading.value = true
  try {
    const { id, accountName, playCount, likeCount, commentCount, shareCount } = editForm.value
    await updateDouyin(id, { accountName, playCount, likeCount, commentCount, shareCount })
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
.diff-up {
  color: #67c23a;
}
.diff-down {
  color: #f56c6c;
}
</style>
