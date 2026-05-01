<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">抖音数据管理</h3>
        <el-button type="primary" @click="handleAdd">新增数据</el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="accountName" label="账号名称" min-width="120" />
        <el-table-column prop="playCount" label="播放量" min-width="140">
          <template #default="{ row }">
            <span>{{ formatNumber(row.playCount) }}</span>
            <span
              v-if="row.playCountGrowth > 0"
              class="ml-2 text-success"
            >+{{ formatNumber(row.playCountGrowth) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="likeCount" label="点赞量" min-width="100">
          <template #default="{ row }">{{ formatNumber(row.likeCount) }}</template>
        </el-table-column>
        <el-table-column prop="commentCount" label="评论量" min-width="100">
          <template #default="{ row }">{{ formatNumber(row.commentCount) }}</template>
        </el-table-column>
        <el-table-column prop="shareCount" label="分享量" min-width="100">
          <template #default="{ row }">{{ formatNumber(row.shareCount) }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="录入时间" min-width="160">
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑数据' : '新增数据'" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="账号名称">
          <el-autocomplete
            v-model="formData.accountName"
            :fetch-suggestions="queryAccounts"
            placeholder="输入或选择账号"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="记录日期">
          <el-date-picker
            v-model="formData.recordDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="播放量">
          <el-input-number v-model="formData.playCount" :min="0" style="width: 100%" />
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
  fetchDouyinList,
  fetchDouyinAccounts,
  fetchAddDouyin,
  fetchUpdateDouyin,
  fetchDeleteDouyin,
  fetchBatchDeleteDouyin
} from '@/api/douyin'

const loading = ref(false)
const tableData = ref<any[]>([])
const accounts = ref<string[]>([])
const selectedIds = ref<number[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formData = ref({
  accountName: '',
  recordDate: new Date().toISOString().split('T')[0],
  playCount: 0,
  likeCount: 0,
  commentCount: 0,
  shareCount: 0
})

const formatNumber = (num: number) => {
  if (!num) return '0'
  return num.toLocaleString()
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await fetchDouyinList()
    tableData.value = res || []
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

const loadAccounts = async () => {
  try {
    const res: any = await fetchDouyinAccounts()
    accounts.value = res || []
  } catch (e) {
    console.error(e)
  }
}

const queryAccounts = (queryString: string, cb: any) => {
  const results = accounts.value
    .filter((item) => item.toLowerCase().includes(queryString.toLowerCase()))
    .map((item) => ({ value: item }))
  cb(results)
}

const handleSelectionChange = (rows: any[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = 0
  formData.value = {
    accountName: '',
    recordDate: new Date().toISOString().split('T')[0],
    playCount: 0,
    likeCount: 0,
    commentCount: 0,
    shareCount: 0
  }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  editId.value = row.id
  formData.value = {
    accountName: row.accountName || '',
    recordDate: row.recordDate || new Date().toISOString().split('T')[0],
    playCount: row.playCount || 0,
    likeCount: row.likeCount || 0,
    commentCount: row.commentCount || 0,
    shareCount: row.shareCount || 0
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await fetchUpdateDouyin(editId.value, formData.value)
      ElMessage.success('更新成功')
    } else {
      await fetchAddDouyin(formData.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (e) {
    console.error(e)
  }
}

const handleDelete = async (id: number) => {
  try {
    await fetchDeleteDouyin(id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    console.error(e)
  }
}

const handleBatchDelete = async () => {
  try {
    await fetchBatchDeleteDouyin(selectedIds.value)
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    loadData()
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
  loadAccounts()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 16px;
}
.text-success {
  color: #67c23a;
  font-size: 12px;
}
</style>
