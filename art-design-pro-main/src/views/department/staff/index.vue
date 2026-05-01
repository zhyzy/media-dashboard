<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">人员管理</h3>
        <div class="flex gap-2">
          <el-select v-model="filterRole" placeholder="筛选角色" clearable style="width: 150px" @change="loadData">
            <el-option v-for="r in roles" :key="r" :label="r" :value="r" />
          </el-select>
          <el-button type="primary" @click="handleAdd">新增人员</el-button>
        </div>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="role" label="角色" min-width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="isActive" label="状态" min-width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">
              {{ row.isActive ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="入职时间" min-width="160">
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑人员' : '新增人员'" width="500px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="formData.name" placeholder="输入姓名" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="formData.role" style="width: 100%">
            <el-option v-for="r in roles" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="formData.phone" placeholder="输入手机号" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.isActive" active-text="在职" inactive-text="离职" />
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
  fetchStaffList,
  fetchStaffRoles,
  fetchAddStaff,
  fetchUpdateStaff,
  fetchDeleteStaff,
  fetchBatchDeleteStaff
} from '@/api/staff'

const roles = ['运营', '模特', '摄影师', '编剧', '发布员', '剪辑师', '主管']

const loading = ref(false)
const tableData = ref<any[]>([])
const filterRole = ref('')
const selectedIds = ref<number[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formData = ref({ name: '', role: '运营', phone: '', isActive: true })

const formatDate = (date: string) => (date ? new Date(date).toLocaleString('zh-CN') : '')

const loadData = async () => {
  loading.value = true
  try { const res: any = await fetchStaffList(filterRole.value || undefined); tableData.value = res || [] } catch (e) { console.error(e) }
  loading.value = false
}

const handleSelectionChange = (rows: any[]) => { selectedIds.value = rows.map((r) => r.id) }

const handleAdd = () => {
  isEdit.value = false; editId.value = 0
  formData.value = { name: '', role: '运营', phone: '', isActive: true }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true; editId.value = row.id
  formData.value = { name: row.name || '', role: row.role || '运营', phone: row.phone || '', isActive: row.isActive !== false }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) { await fetchUpdateStaff(editId.value, formData.value); ElMessage.success('更新成功') }
    else { await fetchAddStaff(formData.value); ElMessage.success('添加成功') }
    dialogVisible.value = false; loadData()
  } catch (e) { console.error(e) }
}

const handleDelete = async (id: number) => {
  try { await fetchDeleteStaff(id); ElMessage.success('删除成功'); loadData() } catch (e) { console.error(e) }
}

const handleBatchDelete = async () => {
  try { await fetchBatchDeleteStaff(selectedIds.value); ElMessage.success('批量删除成功'); selectedIds.value = []; loadData() } catch (e) { console.error(e) }
}

onMounted(() => { loadData() })
</script>

<style scoped lang="scss">
.page-container { padding: 16px; }
</style>
