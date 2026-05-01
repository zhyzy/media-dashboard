<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">子账户管理</h3>
        <el-button type="primary" @click="handleAdd">新增子账户</el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="role" label="角色" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">{{ row.role === 'admin' ? '管理员' : '普通用户' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permissions" label="权限" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="p in (row.permissions || [])" :key="p" size="small" class="mr-1 mb-1">{{ permissionLabels[p] || p }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" min-width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive !== false ? 'success' : 'danger'" size="small">
              {{ row.isActive !== false ? '启用' : '禁用' }}
            </el-tag>
          </template>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑子账户' : '新增子账户'" width="500px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="formData.username" placeholder="输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" v-if="!isEdit">
          <el-input v-model="formData.password" type="password" placeholder="输入密码" show-password />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="formData.role" style="width: 100%">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限">
          <el-checkbox-group v-model="formData.permissions">
            <el-checkbox v-for="(label, key) in permissionLabels" :key="key" :value="key" :label="label" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.isActive" active-text="启用" inactive-text="禁用" />
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
  fetchSubAccountList,
  fetchCreateSubAccount,
  fetchUpdateSubAccount,
  fetchDeleteSubAccount,
  fetchBatchDeleteSubAccount
} from '@/api/account'

const permissionLabels: Record<string, string> = {
  'douyin:view': '抖音查看',
  'douyin:edit': '抖音编辑',
  'kuaishou:view': '快手查看',
  'kuaishou:edit': '快手编辑',
  'video-account:view': '视频号查看',
  'video-account:edit': '视频号编辑',
  'live:view': '直播查看',
  'live:edit': '直播编辑',
  'media:view': '自媒体查看',
  'media:edit': '自媒体编辑',
  'staff:view': '人员查看',
  'staff:edit': '人员编辑',
  'expense:view': '费用查看',
  'expense:edit': '费用编辑',
  'dataease:view': '数据源查看',
  'dataease:edit': '数据源编辑'
}

const loading = ref(false)
const tableData = ref<any[]>([])
const selectedIds = ref<number[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formData = ref({
  username: '',
  password: '',
  role: 'user',
  permissions: [] as string[],
  isActive: true
})

const formatDate = (date: string) => (date ? new Date(date).toLocaleString('zh-CN') : '')

const loadData = async () => {
  loading.value = true
  try { const res: any = await fetchSubAccountList(); tableData.value = res || [] } catch (e) { console.error(e) }
  loading.value = false
}

const handleSelectionChange = (rows: any[]) => { selectedIds.value = rows.map((r) => r.id) }

const handleAdd = () => {
  isEdit.value = false; editId.value = 0
  formData.value = { username: '', password: '', role: 'user', permissions: [], isActive: true }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true; editId.value = row.id
  formData.value = { username: row.username || '', password: '', role: row.role || 'user', permissions: row.permissions || [], isActive: row.isActive !== false }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    const submitData = JSON.parse(JSON.stringify(formData.value))
    if (isEdit.value) { await fetchUpdateSubAccount(editId.value, submitData); ElMessage.success('更新成功') }
    else { await fetchCreateSubAccount(submitData); ElMessage.success('添加成功') }
    dialogVisible.value = false; loadData()
  } catch (e) { console.error(e) }
}

const handleDelete = async (id: number) => {
  try { await fetchDeleteSubAccount(id); ElMessage.success('删除成功'); loadData() } catch (e) { console.error(e) }
}

const handleBatchDelete = async () => {
  try { await fetchBatchDeleteSubAccount(selectedIds.value); ElMessage.success('批量删除成功'); selectedIds.value = []; loadData() } catch (e) { console.error(e) }
}

onMounted(() => { loadData() })
</script>

<style scoped lang="scss">
.page-container { padding: 16px; }
</style>
