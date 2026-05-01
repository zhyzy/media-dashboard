<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">自媒体数据管理</h3>
        <div class="flex gap-2">
          <el-select v-model="filterPlatform" placeholder="筛选平台" clearable style="width: 150px" @change="loadData">
            <el-option v-for="p in platforms" :key="p" :label="p" :value="p" />
          </el-select>
          <el-button type="primary" @click="handleAdd">新增数据</el-button>
        </div>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="platform" label="发布平台" min-width="100" />
        <el-table-column prop="title" label="发布标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="publisher" label="发布人" min-width="100" />
        <el-table-column prop="publishStatus" label="发布状态" min-width="90">
          <template #default="{ row }">
            <el-tag :type="row.publishStatus === '已发布' ? 'success' : row.publishStatus === '草稿' ? 'info' : 'warning'" size="small">
              {{ row.publishStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishDate" label="发布日期" min-width="110" />
        <el-table-column prop="readCount" label="阅读量" min-width="140">
          <template #default="{ row }">
            <span>{{ formatNumber(row.readCount) }}</span>
            <span v-if="row.readCountGrowth > 0" class="ml-2 text-success">+{{ formatNumber(row.readCountGrowth) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="likeCount" label="点赞量" min-width="140">
          <template #default="{ row }">
            <span>{{ formatNumber(row.likeCount) }}</span>
            <span v-if="row.likeCountGrowth > 0" class="ml-2 text-success">+{{ formatNumber(row.likeCountGrowth) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="commentCount" label="评论量" min-width="90">
          <template #default="{ row }">{{ formatNumber(row.commentCount) }}</template>
        </el-table-column>
        <el-table-column prop="shareCount" label="分享量" min-width="90">
          <template #default="{ row }">{{ formatNumber(row.shareCount) }}</template>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑数据' : '新增数据'" width="560px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="发布平台">
          <el-select v-model="formData.platform" style="width: 100%">
            <el-option v-for="p in platforms" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布标题">
          <el-input v-model="formData.title" placeholder="输入文章标题" />
        </el-form-item>
        <el-form-item label="发布人">
          <el-input v-model="formData.publisher" placeholder="输入发布人" />
        </el-form-item>
        <el-form-item label="发布状态">
          <el-select v-model="formData.publishStatus" style="width: 100%">
            <el-option label="已发布" value="已发布" />
            <el-option label="草稿" value="草稿" />
            <el-option label="待审核" value="待审核" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布日期">
          <el-input v-model="formData.publishDate" placeholder="如 2026-04-30" />
        </el-form-item>
        <el-form-item label="记录日期">
          <el-date-picker v-model="formData.recordDate" type="date" placeholder="选择日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="阅读量">
          <el-input-number v-model="formData.readCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="点赞量">
          <el-input-number v-model="formData.likeCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="评论量">
          <el-input-number v-model="formData.commentCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="分享量">
          <el-input-number v-model="formData.shareCount" :min="0" style="width: 100%" />
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
  fetchMediaList,
  fetchAddMedia,
  fetchUpdateMedia,
  fetchDeleteMedia,
  fetchBatchDeleteMedia
} from '@/api/media'

const platforms = ['知乎', '今日头条', '百家号', '微博', '一点资讯', '企鹅号', '搜狐号']

const loading = ref(false)
const tableData = ref<any[]>([])
const filterPlatform = ref('')
const selectedIds = ref<number[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formData = ref({
  platform: '知乎',
  title: '',
  publisher: '',
  publishStatus: '已发布',
  publishDate: '',
  recordDate: new Date().toISOString().split('T')[0],
  readCount: 0,
  likeCount: 0,
  commentCount: 0,
  shareCount: 0
})

const formatNumber = (num: number) => (num || 0).toLocaleString()

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await fetchMediaList(filterPlatform.value || undefined)
    tableData.value = res || []
  } catch (e) { console.error(e) }
  loading.value = false
}

const handleSelectionChange = (rows: any[]) => { selectedIds.value = rows.map((r) => r.id) }

const handleAdd = () => {
  isEdit.value = false; editId.value = 0
  formData.value = { platform: '知乎', title: '', publisher: '', publishStatus: '已发布', publishDate: '', recordDate: new Date().toISOString().split('T')[0], readCount: 0, likeCount: 0, commentCount: 0, shareCount: 0 }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true; editId.value = row.id
  formData.value = { platform: row.platform || '知乎', title: row.title || '', publisher: row.publisher || '', publishStatus: row.publishStatus || '已发布', publishDate: row.publishDate || '', recordDate: row.recordDate || new Date().toISOString().split('T')[0], readCount: row.readCount || 0, likeCount: row.likeCount || 0, commentCount: row.commentCount || 0, shareCount: row.shareCount || 0 }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    const submitData = JSON.parse(JSON.stringify(formData.value))
    if (isEdit.value) { await fetchUpdateMedia(editId.value, submitData); ElMessage.success('更新成功') }
    else { await fetchAddMedia(submitData); ElMessage.success('添加成功') }
    dialogVisible.value = false; loadData()
  } catch (e) { console.error(e) }
}

const handleDelete = async (id: number) => {
  try { await fetchDeleteMedia(id); ElMessage.success('删除成功'); loadData() } catch (e) { console.error(e) }
}

const handleBatchDelete = async () => {
  try { await fetchBatchDeleteMedia(selectedIds.value); ElMessage.success('批量删除成功'); selectedIds.value = []; loadData() } catch (e) { console.error(e) }
}

onMounted(() => { loadData() })
</script>

<style scoped lang="scss">
.page-container { padding: 16px; }
.text-success { color: #67c23a; font-size: 12px; }
</style>
