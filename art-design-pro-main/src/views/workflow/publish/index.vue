<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">发布管理</h3>
        <div class="flex gap-2">
          <el-select v-model="filterStatus" placeholder="筛选状态" clearable style="width: 120px" @change="loadData">
            <el-option v-for="s in statuses" :key="s" :label="s" :value="s" />
          </el-select>
          <el-select v-model="filterPlatform" placeholder="筛选平台" clearable style="width: 130px" @change="loadData">
            <el-option v-for="p in platforms" :key="p" :label="p" :value="p" />
          </el-select>
          <el-button type="primary" @click="handleAdd">新增发布</el-button>
        </div>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="title" label="发布标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="publisher" label="发布人" min-width="90" />
        <el-table-column prop="platform" label="发布平台" min-width="100" />
        <el-table-column prop="publishDate" label="发布日期" min-width="110" />
        <el-table-column prop="status" label="状态" min-width="80">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="播放/阅读" min-width="100">
          <template #default="{ row }">{{ formatNumber(row.viewCount) }}</template>
        </el-table-column>
        <el-table-column prop="likeCount" label="点赞" min-width="80">
          <template #default="{ row }">{{ formatNumber(row.likeCount) }}</template>
        </el-table-column>
        <el-table-column prop="commentCount" label="评论" min-width="80">
          <template #default="{ row }">{{ formatNumber(row.commentCount) }}</template>
        </el-table-column>
        <el-table-column prop="shareCount" label="分享" min-width="80">
          <template #default="{ row }">{{ formatNumber(row.shareCount) }}</template>
        </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑发布' : '新增发布'" width="600px">
      <el-form :model="formData" label-width="90px">
        <el-form-item label="发布标题">
          <el-input v-model="formData.title" placeholder="输入发布标题" />
        </el-form-item>
        <el-form-item label="发布人">
          <el-input v-model="formData.publisher" placeholder="输入发布人" />
        </el-form-item>
        <el-form-item label="发布平台">
          <el-select v-model="formData.platform" style="width: 100%">
            <el-option v-for="p in platforms" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布日期">
          <el-input v-model="formData.publishDate" placeholder="如 2026-04-30" />
        </el-form-item>
        <el-form-item label="发布链接">
          <el-input v-model="formData.publishUrl" placeholder="输入发布链接" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option v-for="s in statuses" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="播放/阅读">
          <el-input-number v-model="formData.viewCount" :min="0" style="width: 100%" />
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
  fetchPublishList,
  fetchAddPublish,
  fetchUpdatePublish,
  fetchDeletePublish,
  fetchBatchDeletePublish
} from '@/api/publish'

const statuses = ['待发布', '已发布', '审核中', '已下架']
const platforms = ['抖音', '快手', '视频号', '知乎', '今日头条', '百家号', '微博', '一点资讯', '企鹅号', '搜狐号']

const loading = ref(false)
const tableData = ref<any[]>([])
const filterStatus = ref('')
const filterPlatform = ref('')
const selectedIds = ref<number[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formData = ref({
  title: '',
  publisher: '',
  platform: '抖音',
  publishDate: '',
  publishUrl: '',
  status: '待发布',
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  shareCount: 0,
  notes: ''
})

const statusTagType = (status: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' | undefined => {
  const map: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = { '待发布': 'info', '已发布': 'success', '审核中': 'warning', '已下架': 'danger' }
  return map[status]
}

const formatNumber = (num: number) => (num || 0).toLocaleString()
const formatDate = (date: string) => (date ? new Date(date).toLocaleString('zh-CN') : '')

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await fetchPublishList(filterStatus.value || undefined, filterPlatform.value || undefined)
    tableData.value = res || []
  } catch (e) { console.error(e) }
  loading.value = false
}

const handleSelectionChange = (rows: any[]) => { selectedIds.value = rows.map((r) => r.id) }

const handleAdd = () => {
  isEdit.value = false; editId.value = 0
  formData.value = { title: '', publisher: '', platform: '抖音', publishDate: '', publishUrl: '', status: '待发布', viewCount: 0, likeCount: 0, commentCount: 0, shareCount: 0, notes: '' }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true; editId.value = row.id
  formData.value = { title: row.title || '', publisher: row.publisher || '', platform: row.platform || '抖音', publishDate: row.publishDate || '', publishUrl: row.publishUrl || '', status: row.status || '待发布', viewCount: row.viewCount || 0, likeCount: row.likeCount || 0, commentCount: row.commentCount || 0, shareCount: row.shareCount || 0, notes: row.notes || '' }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) { await fetchUpdatePublish(editId.value, formData.value); ElMessage.success('更新成功') }
    else { await fetchAddPublish(formData.value); ElMessage.success('添加成功') }
    dialogVisible.value = false; loadData()
  } catch (e) { console.error(e) }
}

const handleDelete = async (id: number) => {
  try { await fetchDeletePublish(id); ElMessage.success('删除成功'); loadData() } catch (e) { console.error(e) }
}

const handleBatchDelete = async () => {
  try { await fetchBatchDeletePublish(selectedIds.value); ElMessage.success('批量删除成功'); selectedIds.value = []; loadData() } catch (e) { console.error(e) }
}

onMounted(() => { loadData() })
</script>

<style scoped lang="scss">
.page-container { padding: 16px; }
</style>
