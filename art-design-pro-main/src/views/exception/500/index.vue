<template>
  <div class="exception-page">
    <h1>500</h1>
    <p>抱歉，服务器出错了</p>
    <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
  </div>
</template>

<style scoped>
.exception-page { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
.exception-page h1 { font-size: 72px; color: #fa8c16; margin-bottom: 16px; }
.exception-page p { font-size: 16px; color: #666; margin-bottom: 24px; }
</style>
