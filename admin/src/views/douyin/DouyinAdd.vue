<template>
  <div>
    <el-page-header @back="$router.push('/douyin')" title="返回" content="新增抖音数据" />
    <el-card style="margin-top: 20px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" style="max-width: 500px">
        <el-form-item label="账号名称" prop="accountName">
          <div style="display: flex; gap: 8px; width: 100%">
            <el-select
              v-if="!isNewAccount"
              v-model="form.accountName"
              placeholder="选择已有账号"
              style="flex: 1"
              filterable
            >
              <el-option v-for="name in accountNames" :key="name" :label="name" :value="name" />
            </el-select>
            <el-input
              v-else
              v-model="form.accountName"
              placeholder="请输入新账号名称"
              style="flex: 1"
            />
            <el-button :type="isNewAccount ? 'default' : 'success'" @click="toggleNewAccount">
              {{ isNewAccount ? '选择已有' : '新增账号' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="播放量" prop="playCount">
          <el-input-number v-model="form.playCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="点赞数" prop="likeCount">
          <el-input-number v-model="form.likeCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="评论数" prop="commentCount">
          <el-input-number v-model="form.commentCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="转发数" prop="shareCount">
          <el-input-number v-model="form.shareCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { addDouyin, getDouyinAccounts } from '../../api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const isNewAccount = ref(false)
const accountNames = ref([])

const form = reactive({
  accountName: '',
  playCount: 0,
  likeCount: 0,
  commentCount: 0,
  shareCount: 0,
})

const rules = {
  accountName: [{ required: true, message: '请输入或选择账号名称', trigger: 'change' }],
}

function toggleNewAccount() {
  isNewAccount.value = !isNewAccount.value
  form.accountName = ''
}

async function fetchAccounts() {
  try {
    accountNames.value = await getDouyinAccounts()
  } catch (e) {
    accountNames.value = []
  }
}

async function handleSubmit() {
  await formRef.value.validate()
  loading.value = true
  try {
    await addDouyin(form)
    ElMessage.success('添加成功')
    router.push('/douyin')
  } catch (e) {
  } finally {
    loading.value = false
  }
}

function resetForm() {
  formRef.value.resetFields()
}

onMounted(fetchAccounts)
</script>
