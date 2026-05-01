<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2 style="margin: 0">自媒体数据列表</h2>
      <div>
        <el-select v-model="platform" placeholder="筛选平台" clearable style="width: 150px; margin-right: 10px" @change="fetchList">
          <el-option v-for="p in platforms" :key="p" :label="p" :value="p" />
        </el-select>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量删除 ({{ selectedIds.length }})
        </el-button>
        <el-button type="primary" @click="$router.push('/media/add')">新增数据</el-button>
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
      <el-table-column prop="platform" label="平台" width="100" />
      <el-table-column prop="title" label="文章标题" min-width="200" show-overflow-tooltip />
      <el-table-column label="阅读量" width="140">
        <template #default="{ row }">
          <span style="font-weight: 600; color: #409eff">{{ row.readCount?.toLocaleString() }}</span>
          <span v-if="row.readCountDiff !== undefined" :class="row.readCountDiff >= 0 ? 'diff-up' : 'diff-down'" style="margin-left: 6px; font-size: 12px">
            {{ row.readCountDiff >= 0 ? '+' : '' }}{{ row.readCountDiff?.toLocaleString() }}
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

    <el-dialog v-model="editDialogVisible" title="编辑自媒体数据" width="500px" destroy-on-close>
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="平台">
          <el-select v-model="editForm.platform" style="width: 100%">
            <el-option v-for="p in platforms" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="文章标题">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="阅读量">
          <el-input-number v-model="editForm.readCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="点赞数">
          <el-input-number v-model="editForm.likeCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="评论数">
          <el-input-number v-model="editForm.commentCount" :min="0" style="width: 100%" />
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
import { getMediaList, updateMedia, deleteMedia, batchDeleteMedia } from '../../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const platforms = ['知乎', '今日头条', '百家号', '微博', '一点资讯', '企鹅号', '搜狐号']
const list = ref([])
const loading = ref(false)
const platform = ref('')
const selectedIds = ref([])
const currentPage = ref(1)
const pageSize = ref(20)

const editDialogVisible = ref(false)
const editLoading = ref(false)
const editForm = ref({})

const processedList = computed(() => {
  const sorted = [...list.value].sort((a, b) => {
    if (a.platform !== b.platform) return a.platform.localeCompare(b.platform)
    if (a.title !== b.title) return a.title.localeCompare(b.title)
    return new Date(b.createTime) - new Date(a.createTime)
  })

  return sorted.map((item, index) => {
    const row = { ...item }
    const prevRecord = sorted.find((r) => {
      if (r.id === item.id) return false
      return r.platform === item.platform && r.title === item.title && new Date(r.createTime) < new Date(item.createTime)
    })
    if (prevRecord) {
      row.readCountDiff = item.readCount - prevRecord.readCount
      row.likeCountDiff = item.likeCount - prevRecord.likeCount
      row.commentCountDiff = item.commentCount - prevRecord.commentCount
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
    const params = platform.value ? { platform: platform.value } : {}
    list.value = await getMediaList(params)
  } finally {
    loading.value = false
  }
}

function handleSelectionChange(rows) {
  selectedIds.value = rows.map((r) => r.id)
}

async function handleBatchDelete() {
  await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条数据？`, '批量删除', { type: 'warning' })
  await batchDeleteMedia(selectedIds.value)
  ElMessage.success('批量删除成功')
  fetchList()
}

async function handleDelete(id) {
  await deleteMedia(id)
  ElMessage.success('删除成功')
  fetchList()
}

function handleEdit(row) {
  editForm.value = {
    id: row.id,
    platform: row.platform,
    title: row.title,
    readCount: row.readCount,
    likeCount: row.likeCount,
    commentCount: row.commentCount,
  }
  editDialogVisible.value = true
}

async function handleUpdate() {
  editLoading.value = true
  try {
    const { id, platform, title, readCount, likeCount, commentCount } = editForm.value
    await updateMedia(id, { platform, title, readCount, likeCount, commentCount })
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
