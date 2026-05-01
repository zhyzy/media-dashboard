<template>
  <div>
    <el-page-header @back="$router.push('/kuaishou')" title="返回" content="新增快手数据" />
    <el-card style="margin-top: 20px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" style="max-width: 500px">
        <el-form-item label="曝光量" prop="exposure">
          <el-input-number v-model="form.exposure" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="观看人数" prop="viewers">
          <el-input-number v-model="form.viewers" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="停留时长" prop="duration">
          <el-input v-model="form.duration" placeholder="如 30min" />
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { addKuaishou } from '../../api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({ exposure: 0, viewers: 0, duration: '' })

const rules = {
  duration: [{ required: true, message: '请输入停留时长', trigger: 'blur' }],
}

async function handleSubmit() {
  await formRef.value.validate()
  loading.value = true
  try {
    await addKuaishou(form)
    ElMessage.success('添加成功')
    router.push('/kuaishou')
  } catch (e) {
  } finally {
    loading.value = false
  }
}

function resetForm() {
  formRef.value.resetFields()
}
</script>
