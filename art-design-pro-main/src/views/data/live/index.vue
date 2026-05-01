<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">直播数据管理</h3>
        <el-button type="primary" @click="handleAdd">新增数据</el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="platform" label="直播平台" min-width="100" />
        <el-table-column prop="accountName" label="账号名称" min-width="120" />
        <el-table-column prop="exposure" label="曝光量" min-width="140">
          <template #default="{ row }">
            <span>{{ formatNumber(row.exposure) }}</span>
            <span v-if="row.exposureGrowth > 0" class="ml-2 text-success">+{{ formatNumber(row.exposureGrowth) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="viewers" label="观看人数" min-width="140">
          <template #default="{ row }">
            <span>{{ formatNumber(row.viewers) }}</span>
            <span v-if="row.viewersGrowth > 0" class="ml-2 text-success">+{{ formatNumber(row.viewersGrowth) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="avgStayDuration" label="平均停留时长" min-width="120" />
        <el-table-column prop="salesAmount" label="售卖金额" min-width="140">
          <template #default="{ row }">
            <span>¥{{ Number(row.salesAmount || 0).toFixed(2) }}</span>
            <span v-if="row.salesAmountGrowth > 0" class="ml-2 text-success">+¥{{ Number(row.salesAmountGrowth).toFixed(2) }}</span>
          </template>
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
      <el-form :model="formData" label-width="110px">
        <el-form-item label="直播平台">
          <el-select v-model="formData.platform" style="width: 100%">
            <el-option label="抖音直播" value="抖音直播" />
            <el-option label="快手直播" value="快手直播" />
            <el-option label="视频号直播" value="视频号直播" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号名称">
          <el-input v-model="formData.accountName" placeholder="输入账号名称" />
        </el-form-item>
        <el-form-item label="记录日期">
          <el-date-picker v-model="formData.recordDate" type="date" placeholder="选择日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="曝光量">
          <el-input-number v-model="formData.exposure" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="观看人数">
          <el-input-number v-model="formData.viewers" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="平均停留时长">
          <el-input v-model="formData.avgStayDuration" placeholder="如 3min" />
        </el-form-item>
        <el-form-item label="售卖金额">
          <el-input-number v-model="formData.salesAmount" :min="0" :precision="2" style="width: 100%" />
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
  fetchLiveList,
  fetchAddLive,
  fetchUpdateLive,
  fetchDeleteLive,
  fetchBatchDeleteLive
} from '@/api/live'

const loading = ref(false)
const tableData = ref<any[]>([])
const selectedIds = ref<number[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formData = ref({
  platform: '抖音直播',
  accountName: '',
  recordDate: new Date().toISOString().split('T')[0],
  exposure: 0,
  viewers: 0,
  avgStayDuration: '0min',
  salesAmount: 0
})

const formatNumber = (num: number) => (num || 0).toLocaleString()
const formatDate = (date: string) => (date ? new Date(date).toLocaleString('zh-CN') : '')

const loadData = async () => {
  loading.value = true
  try { const res: any = await fetchLiveList(); tableData.value = res || [] } catch (e) { console.error(e) }
  loading.value = false
}

const handleSelectionChange = (rows: any[]) => { selectedIds.value = rows.map((r) => r.id) }

const handleAdd = () => {
  isEdit.value = false; editId.value = 0
  formData.value = { platform: '抖音直播', accountName: '', recordDate: new Date().toISOString().split('T')[0], exposure: 0, viewers: 0, avgStayDuration: '0min', salesAmount: 0 }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true; editId.value = row.id
  formData.value = { platform: row.platform || '抖音直播', accountName: row.accountName || '', recordDate: row.recordDate || new Date().toISOString().split('T')[0], exposure: row.exposure || 0, viewers: row.viewers || 0, avgStayDuration: row.avgStayDuration || '0min', salesAmount: row.salesAmount || 0 }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    const submitData = JSON.parse(JSON.stringify(formData.value))
    if (isEdit.value) { await fetchUpdateLive(editId.value, submitData); ElMessage.success('更新成功') }
    else { await fetchAddLive(submitData); ElMessage.success('添加成功') }
    dialogVisible.value = false; loadData()
  } catch (e) { console.error(e) }
}

const handleDelete = async (id: number) => {
  try { await fetchDeleteLive(id); ElMessage.success('删除成功'); loadData() } catch (e) { console.error(e) }
}

const handleBatchDelete = async () => {
  try { await fetchBatchDeleteLive(selectedIds.value); ElMessage.success('批量删除成功'); selectedIds.value = []; loadData() } catch (e) { console.error(e) }
}

onMounted(() => { loadData() })
</script>

<style scoped lang="scss">
.page-container { padding: 16px; }
.text-success { color: #67c23a; font-size: 12px; }
</style>
