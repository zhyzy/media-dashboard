<template>
  <div class="page-container">
    <el-row :gutter="16" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #e6f7ff"><i class="ri-file-text-line" style="color: #1890ff"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ overview.script?.total || 0 }}</div>
            <div class="stat-label">剧本总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #fff7e6"><i class="ri-camera-line" style="color: #fa8c16"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ overview.shooting?.total || 0 }}</div>
            <div class="stat-label">拍摄总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #f6ffed"><i class="ri-send-plane-line" style="color: #52c41a"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ overview.publish?.total || 0 }}</div>
            <div class="stat-label">发布总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #fff0f6"><i class="ri-line-chart-line" style="color: #eb2f96"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(overview.traffic?.totalViews || 0) }}</div>
            <div class="stat-label">总流量</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mb-4">
      <el-col :span="8">
        <el-card shadow="never">
          <template #header><span class="font-bold">剧本状态分布</span></template>
          <div v-for="item in overview.script?.byStatus || []" :key="item.status" class="status-row">
            <el-tag :type="scriptStatusType(item.status)" size="small">{{ item.status }}</el-tag>
            <span class="status-count">{{ item.count }}</span>
          </div>
          <el-empty v-if="!overview.script?.byStatus?.length" description="暂无数据" :image-size="60" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <template #header><span class="font-bold">拍摄状态分布</span></template>
          <div v-for="item in overview.shooting?.byStatus || []" :key="item.status" class="status-row">
            <el-tag :type="shootingStatusType(item.status)" size="small">{{ item.status }}</el-tag>
            <span class="status-count">{{ item.count }}</span>
          </div>
          <el-empty v-if="!overview.shooting?.byStatus?.length" description="暂无数据" :image-size="60" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <template #header><span class="font-bold">发布状态分布</span></template>
          <div v-for="item in overview.publish?.byStatus || []" :key="item.status" class="status-row">
            <el-tag :type="publishStatusType(item.status)" size="small">{{ item.status }}</el-tag>
            <span class="status-count">{{ item.count }}</span>
          </div>
          <el-empty v-if="!overview.publish?.byStatus?.length" description="暂无数据" :image-size="60" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span class="font-bold">各平台发布统计</span></template>
          <el-table :data="overview.publish?.byPlatform || []" size="small" v-if="overview.publish?.byPlatform?.length">
            <el-table-column prop="platform" label="平台" min-width="100" />
            <el-table-column prop="count" label="发布数" min-width="80" />
            <el-table-column prop="totalViews" label="总播放/阅读" min-width="120">
              <template #default="{ row }">{{ formatNumber(Number(row.totalViews)) }}</template>
            </el-table-column>
            <el-table-column prop="totalLikes" label="总点赞" min-width="100">
              <template #default="{ row }">{{ formatNumber(Number(row.totalLikes)) }}</template>
            </el-table-column>
            <el-table-column prop="totalShares" label="总分享" min-width="100">
              <template #default="{ row }">{{ formatNumber(Number(row.totalShares)) }}</template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无数据" :image-size="60" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span class="font-bold">流量汇总</span></template>
          <div class="traffic-summary">
            <div class="traffic-item">
              <div class="traffic-value">{{ formatNumber(overview.traffic?.totalViews || 0) }}</div>
              <div class="traffic-label">总播放/阅读量</div>
            </div>
            <div class="traffic-item">
              <div class="traffic-value">{{ formatNumber(overview.traffic?.totalLikes || 0) }}</div>
              <div class="traffic-label">总点赞量</div>
            </div>
            <div class="traffic-item">
              <div class="traffic-value">{{ formatNumber(overview.traffic?.totalShares || 0) }}</div>
              <div class="traffic-label">总分享量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchWorkflowOverview } from '@/api/workflow'

const overview = ref<any>({})

const formatNumber = (num: number) => (num || 0).toLocaleString()

const scriptStatusType = (s: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' | undefined => {
  const m: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = { '草稿': 'info', '审核中': 'warning', '已通过': 'success', '已驳回': 'danger' }
  return m[s]
}
const shootingStatusType = (s: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' | undefined => {
  const m: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = { '待拍摄': 'info', '拍摄中': 'warning', '已完成': 'success', '已取消': 'danger' }
  return m[s]
}
const publishStatusType = (s: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' | undefined => {
  const m: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = { '待发布': 'info', '已发布': 'success', '审核中': 'warning', '已下架': 'danger' }
  return m[s]
}

const loadData = async () => {
  try {
    const res: any = await fetchWorkflowOverview()
    overview.value = res || {}
  } catch (e) { console.error(e) }
}

onMounted(() => { loadData() })
</script>

<style scoped lang="scss">
.page-container { padding: 16px; }

.stat-card {
  :deep(.el-card__body) { display: flex; align-items: center; gap: 16px; }
}
.stat-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  i { font-size: 24px; }
}
.stat-info { flex: 1; }
.stat-value { font-size: 28px; font-weight: 700; color: #1f2937; }
.stat-label { font-size: 13px; color: #9ca3af; margin-top: 2px; }

.status-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0; border-bottom: 1px solid #f3f4f6;
  &:last-child { border-bottom: none; }
}
.status-count { font-weight: 600; color: #374151; }

.traffic-summary {
  display: flex; gap: 24px; justify-content: center; padding: 20px 0;
}
.traffic-item { text-align: center; }
.traffic-value { font-size: 32px; font-weight: 700; color: #1f2937; }
.traffic-label { font-size: 13px; color: #9ca3af; margin-top: 4px; }
</style>
