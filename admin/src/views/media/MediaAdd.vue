<template>
  <div>
    <el-page-header @back="$router.push('/media')" title="返回" content="新增自媒体数据" />
    <el-card style="margin-top: 20px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" style="max-width: 500px">
        <el-form-item label="平台" prop="platform">
          <el-select v-model="form.platform" placeholder="请选择平台" style="width: 100%">
            <el-option v-for="p in platforms" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="阅读量" prop="readCount">
          <el-input-number v-model="form.readCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="点赞数" prop="likeCount">
          <el-input-number v-model="form.likeCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="评论数" prop="commentCount">
          <el-input-number v-model="form.commentCount" :min="0" style="width: 100%" />
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
import { addMedia } from '../../api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const platforms = ['知乎', '今日头条', '百家号', '微博', '一点资讯', '企鹅号', '搜狐号']

const form = reactive({
  platform: '',
  title: '',
  readCount: 0,
  likeCount: 0,
  commentCount: 0,
})

const rules = {
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
}

async function handleSubmit() {
  await formRef.value.validate()
  loading.value = true
  try {
    await addMedia(form)
    ElMessage.success('添加成功')
    router.push('/media')
  } catch (e) {
    // handled
  } finally {
    loading.value = false
  }
}

function resetForm() {
  formRef.value.resetFields()
}
</script>
