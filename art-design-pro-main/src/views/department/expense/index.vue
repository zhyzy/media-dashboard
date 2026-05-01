<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">费用管理</h3>
        <el-button type="primary" @click="handleAdd">新增支出</el-button>
      </div>

      <div class="mb-4 flex gap-4">
        <el-statistic title="总支出" :value="summary.totalAmount" prefix="¥" />
      </div>

      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="department" label="部门" min-width="100" />
        <el-table-column prop="category" label="费用类别" min-width="100" />
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="amount" label="金额" min-width="120">
          <template #default="{ row }">¥{{ Number(row.amount || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="expenseDate" label="支出日期" min-width="110" />
        <el-table-column prop="createdBy" label="录入人" min-width="100" />
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

    <el-card shadow="never" class="mt-4" v-if="summary.byCategory.length > 0">
      <h3 class="text-lg font-bold mb-4">费用汇总</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="item in summary.byCategory" :key="item.category" :label="item.category">
          ¥{{ item.totalAmount.toFixed(2) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑支出' : '新增支出'" width="500px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="部门">
          <el-input v-model="formData.department" placeholder="如 推广部" />
        </el-form-item>
        <el-form-item label="费用类别">
          <el-select v-model="formData.category" style="width: 100%">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="费用描述" />
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="formData.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="支出日期">
          <el-input v-model="formData.expenseDate" placeholder="如 2026-04-30" />
        </el-form-item>
        <el-form-item label="录入人">
          <el-input v-model="formData.createdBy" placeholder="输入录入人" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchExpenseList,
  fetchExpenseSummary,
  fetchAddExpense,
  fetchUpdateExpense,
  fetchDeleteExpense,
  fetchBatchDeleteExpense
} from '@/api/expense'

const categories = ['人员工资', '日常支出', '设备采购', '差旅费', '广告投放', '办公费用', '其他']

const loading = ref(false)
const tableData = ref<any[]>([])
const selectedIds = ref<number[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const summary = reactive<{ totalAmount: number; byCategory: any[] }>({ totalAmount: 0, byCategory: [] })
const formData = ref({
  department: '推广部',
  category: '日常支出',
  description: '',
  amount: 0,
  expenseDate: '',
  createdBy: ''
})

const loadData = async () => {
  loading.value = true
  try { const res: any = await fetchExpenseList(); tableData.value = res || [] } catch (e) { console.error(e) }
  loading.value = false
}

const loadSummary = async () => {
  try {
    const res: any = await fetchExpenseSummary()
    summary.totalAmount = res?.totalAmount || 0
    summary.byCategory = res?.byCategory || []
  } catch (e) { console.error(e) }
}

const handleSelectionChange = (rows: any[]) => { selectedIds.value = rows.map((r) => r.id) }

const handleAdd = () => {
  isEdit.value = false; editId.value = 0
  formData.value = { department: '推广部', category: '日常支出', description: '', amount: 0, expenseDate: '', createdBy: '' }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true; editId.value = row.id
  formData.value = { department: row.department || '推广部', category: row.category || '日常支出', description: row.description || '', amount: row.amount || 0, expenseDate: row.expenseDate || '', createdBy: row.createdBy || '' }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) { await fetchUpdateExpense(editId.value, formData.value); ElMessage.success('更新成功') }
    else { await fetchAddExpense(formData.value); ElMessage.success('添加成功') }
    dialogVisible.value = false; loadData(); loadSummary()
  } catch (e) { console.error(e) }
}

const handleDelete = async (id: number) => {
  try { await fetchDeleteExpense(id); ElMessage.success('删除成功'); loadData(); loadSummary() } catch (e) { console.error(e) }
}

const handleBatchDelete = async () => {
  try { await fetchBatchDeleteExpense(selectedIds.value); ElMessage.success('批量删除成功'); selectedIds.value = []; loadData(); loadSummary() } catch (e) { console.error(e) }
}

onMounted(() => { loadData(); loadSummary() })
</script>

<style scoped lang="scss">
.page-container { padding: 16px; }
</style>
