<template>
  <el-container style="height: 100vh">
    <el-aside width="220px" class="admin-aside">
      <div class="logo-area">
        <div class="logo-icon">遇</div>
        <div class="logo-text">
          <div class="logo-title">遇见约到家</div>
          <div class="logo-sub">流量管理后台</div>
        </div>
      </div>
      <el-menu
        :default-active="$route.path"
        background-color="transparent"
        text-color="rgba(255,255,255,0.7)"
        active-text-color="#fff"
        router
        class="side-menu"
      >
        <el-sub-menu index="/douyin">
          <template #title>
            <el-icon><VideoCamera /></el-icon>
            <span>抖音数据</span>
          </template>
          <el-menu-item index="/douyin">
            <el-icon><List /></el-icon>数据列表
          </el-menu-item>
          <el-menu-item index="/douyin/add">
            <el-icon><Plus /></el-icon>新增数据
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/kuaishou">
          <template #title>
            <el-icon><VideoPlay /></el-icon>
            <span>快手数据</span>
          </template>
          <el-menu-item index="/kuaishou">
            <el-icon><List /></el-icon>数据列表
          </el-menu-item>
          <el-menu-item index="/kuaishou/add">
            <el-icon><Plus /></el-icon>新增数据
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/media">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>自媒体数据</span>
          </template>
          <el-menu-item index="/media">
            <el-icon><List /></el-icon>数据列表
          </el-menu-item>
          <el-menu-item index="/media/add">
            <el-icon><Plus /></el-icon>新增数据
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/dataease">
          <el-icon><Connection /></el-icon>
          <span>DataEase数据源</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <div class="header-breadcrumb">
          <el-icon style="margin-right: 6px"><HomeFilled /></el-icon>
          <span>首页</span>
          <span v-if="$route.meta.title" style="margin: 0 8px">/</span>
          <span v-if="$route.meta.title">{{ $route.meta.title }}</span>
        </div>
        <div class="header-right">
          <el-dropdown>
            <div class="user-info">
              <el-avatar :size="32" style="background: linear-gradient(135deg, #667eea, #764ba2)">
                {{ userStore.userInfo.username?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <span class="user-name">{{ userStore.userInfo.username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import { VideoCamera, VideoPlay, Document, List, Plus, HomeFilled, SwitchButton, Connection } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-aside {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-right: none;
  overflow-y: auto;
}

.logo-area {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 8px;
}

.logo-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  line-height: 1.2;
}

.logo-sub {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  margin-top: 2px;
}

.side-menu {
  border-right: none;
}

.side-menu .el-menu-item {
  border-radius: 8px;
  margin: 2px 8px;
  height: 40px;
  line-height: 40px;
}

.side-menu .el-menu-item.is-active {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.4), rgba(118, 75, 162, 0.2)) !important;
}

.side-menu .el-sub-menu :deep(.el-sub-menu__title) {
  border-radius: 8px;
  margin: 2px 8px;
  height: 44px;
  line-height: 44px;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 24px;
  height: 56px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.header-breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f5f5f5;
}

.user-name {
  margin-left: 8px;
  font-size: 14px;
  color: #333;
}

.admin-main {
  background: #f5f7fa;
  padding: 24px;
  overflow-y: auto;
}
</style>
