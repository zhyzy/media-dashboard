<template>
  <div class="screen-wrapper">
    <div class="screen" ref="screenRef">
      <div class="screen-content">
        <header class="header">
          <div class="header-left">
            <span class="status-dot"></span>
            <span>系统运行中</span>
          </div>
          <h1 class="header-title">遇见约到家 · 新媒体流量监测平台</h1>
          <div class="header-right">
            <span class="time">{{ currentTime }}</span>
          </div>
        </header>

        <main class="main">
          <div class="col-left">
            <div class="panel" style="flex: 1">
              <div class="panel-title">抖音账号排行</div>
              <div ref="douyinChartRef" style="height: 100%"></div>
            </div>
          </div>

          <div class="col-center">
            <div class="panel core-kpi-panel">
              <div class="panel-title">核心流量数据</div>
              <div class="core-kpi-main">
                <div class="core-kpi-item primary">
                  <div class="core-kpi-label">总播放量</div>
                  <CountUp :value="summary.totalPlayCount" class="core-number" />
                  <div class="core-kpi-sub">
                    <span class="sub-item"><i class="sub-icon douyin"></i>抖音 {{ formatNum(summary.douyin?.totalPlayCount || 0) }}</span>
                    <span class="sub-item"><i class="sub-icon kuaishou"></i>快手曝光 {{ formatNum(summary.kuaishou?.totalExposure || 0) }}</span>
                    <span class="sub-item"><i class="sub-icon media"></i>自媒体阅读 {{ formatNum(summary.media?.totalReadCount || 0) }}</span>
                  </div>
                </div>
              </div>
              <div class="core-kpi-row">
                <div class="core-kpi-item">
                  <div class="core-kpi-label">总点赞</div>
                  <CountUp :value="summary.totalLikeCount" />
                </div>
                <div class="core-kpi-item">
                  <div class="core-kpi-label">总评论</div>
                  <CountUp :value="summary.totalCommentCount" />
                </div>
                <div class="core-kpi-item">
                  <div class="core-kpi-label">总转发</div>
                  <CountUp :value="summary.totalShareCount" />
                </div>
              </div>
            </div>

            <div class="panel" style="flex: 1">
              <div class="panel-title">趋势分析（近7天）</div>
              <div ref="trendChartRef" style="height: 100%"></div>
            </div>
          </div>

          <div class="col-right">
            <div class="panel" style="flex: 1">
              <div class="panel-title">快手直播数据</div>
              <div ref="kuaishouChartRef" style="height: 100%"></div>
            </div>

            <div class="panel">
              <div class="panel-title">自媒体平台分布</div>
              <div ref="mediaChartRef" style="height: 260px"></div>
            </div>

            <div class="panel">
              <div class="panel-title">实时动态</div>
              <div class="realtime-list" ref="realtimeRef">
                <div v-for="(item, i) in realtimeData" :key="i" class="realtime-item">
                  <span class="realtime-tag" :class="item.type">{{ item.tag }}</span>
                  <span class="realtime-text">{{ item.text }}</span>
                  <span class="realtime-value">+{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer class="footer">
          <div class="footer-col">
            <div class="panel" style="height: 100%">
              <div class="panel-title">自媒体文章阅读排行</div>
              <div class="scroll-wrap">
                <div class="scroll-inner" :class="{ scrolling: mediaRanking.length > 5 }">
                  <div v-for="(item, i) in mediaRanking" :key="'a-' + i" class="rank-item">
                    <span class="rank-index" :class="{ top: i < 3 }">{{ i + 1 }}</span>
                    <span class="rank-title">{{ item.title }}</span>
                    <span class="rank-value">{{ formatNum(item.readCount || 0) }}</span>
                  </div>
                  <div v-if="mediaRanking.length > 5" class="scroll-gap"></div>
                  <template v-if="mediaRanking.length > 5">
                    <div v-for="(item, i) in mediaRanking" :key="'b-' + i" class="rank-item">
                      <span class="rank-index" :class="{ top: i < 3 }">{{ i + 1 }}</span>
                      <span class="rank-title">{{ item.title }}</span>
                      <span class="rank-value">{{ formatNum(item.readCount || 0) }}</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div class="footer-col">
            <div class="panel" style="height: 100%">
              <div class="panel-title">自媒体平台阅读量</div>
              <div class="scroll-wrap">
                <div class="scroll-inner" :class="{ scrolling: platformData.length > 5 }">
                  <div v-for="(item, i) in platformData" :key="'c-' + i" class="rank-item">
                    <span class="rank-index platform-idx" :class="{ top: i < 3 }">{{ i + 1 }}</span>
                    <span class="rank-title">{{ item.platform }}</span>
                    <span class="rank-value">{{ formatNum(item.totalReadCount || 0) }}</span>
                  </div>
                  <div v-if="platformData.length > 5" class="scroll-gap"></div>
                  <template v-if="platformData.length > 5">
                    <div v-for="(item, i) in platformData" :key="'d-' + i" class="rank-item">
                      <span class="rank-index platform-idx" :class="{ top: i < 3 }">{{ i + 1 }}</span>
                      <span class="rank-title">{{ item.platform }}</span>
                      <span class="rank-value">{{ formatNum(item.totalReadCount || 0) }}</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { io } from 'socket.io-client'
import CountUp from './components/CountUp.vue'
import {
  getDashboardSummary,
  getDashboardTrend,
  getDashboardRankings,
  getDouyinList,
  getKuaishouList,
  getMediaDistribution,
} from './api'

const screenRef = ref(null)
const douyinChartRef = ref(null)
const kuaishouChartRef = ref(null)
const mediaChartRef = ref(null)
const trendChartRef = ref(null)
const realtimeRef = ref(null)

let douyinChart = null
let kuaishouChart = null
let mediaChart = null
let trendChart = null
let timer = null
let socket = null

const summary = ref({
  totalPlayCount: 0,
  totalLikeCount: 0,
  totalCommentCount: 0,
  totalShareCount: 0,
  douyin: {},
  kuaishou: {},
  media: {},
})

const mediaRanking = ref([])
const platformData = ref([])
const realtimeData = ref([])
const currentTime = ref('')

function formatNum(n) {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿'
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return n.toLocaleString()
}

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function handleResize() {
  const screen = screenRef.value
  if (!screen) return
  const w = window.innerWidth
  const h = window.innerHeight
  const scale = Math.min(w / 1920, h / 1080)
  const offsetX = (w - 1920 * scale) / 2
  const offsetY = (h - 1080 * scale) / 2
  screen.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
  screen.style.transformOrigin = 'left top'
}

function initCharts() {
  douyinChart = echarts.init(douyinChartRef.value, null, { renderer: 'canvas' })
  kuaishouChart = echarts.init(kuaishouChartRef.value, null, { renderer: 'canvas' })
  mediaChart = echarts.init(mediaChartRef.value, null, { renderer: 'canvas' })
  trendChart = echarts.init(trendChartRef.value, null, { renderer: 'canvas' })

  window.addEventListener('resize', () => {
    douyinChart?.resize()
    kuaishouChart?.resize()
    mediaChart?.resize()
    trendChart?.resize()
  })
}

async function fetchSummary() {
  const data = await getDashboardSummary()
  summary.value = data
}

async function fetchDouyinChart() {
  const list = await getDouyinList()
  const accountMap = {}
  list.forEach((item) => {
    if (!accountMap[item.accountName]) {
      accountMap[item.accountName] = { playCount: 0, likeCount: 0 }
    }
    accountMap[item.accountName].playCount += item.playCount
    accountMap[item.accountName].likeCount += item.likeCount
  })

  const accounts = Object.keys(accountMap)
  const playCounts = accounts.map((a) => accountMap[a].playCount)
  const likeCounts = accounts.map((a) => accountMap[a].likeCount)

  douyinChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#aaa' }, top: 0 },
    grid: { left: 50, right: 16, bottom: 30, top: 40 },
    xAxis: {
      type: 'category',
      data: accounts.map((a) => a.length > 5 ? a.slice(0, 5) + '…' : a),
      axisLabel: { color: '#8aa4be', fontSize: 10, rotate: 25 },
      axisLine: { lineStyle: { color: 'rgba(0,180,255,0.3)' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#8aa4be', formatter: (v) => v >= 10000 ? (v / 10000).toFixed(0) + 'w' : v },
      splitLine: { lineStyle: { color: 'rgba(0,180,255,0.1)' } },
    },
    series: [
      {
        name: '播放量',
        type: 'bar',
        data: playCounts,
        barWidth: '30%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00b4ff' },
            { offset: 1, color: '#003366' },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: '点赞量',
        type: 'bar',
        data: likeCounts,
        barWidth: '30%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ff6b6b' },
            { offset: 1, color: '#660033' },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  })
}

async function fetchKuaishouChart() {
  const list = await getKuaishouList()
  const dateMap = {}
  list.forEach((item) => {
    const date = (item.createTime || '').split('T')[0]
    if (!dateMap[date]) dateMap[date] = { exposure: 0, viewers: 0 }
    dateMap[date].exposure += item.exposure
    dateMap[date].viewers += item.viewers
  })

  const dates = Object.keys(dateMap).sort()
  const exposures = dates.map((d) => dateMap[d].exposure)
  const viewers = dates.map((d) => dateMap[d].viewers)

  kuaishouChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#aaa' }, top: 0 },
    grid: { left: 50, right: 16, bottom: 30, top: 40 },
    xAxis: {
      type: 'category',
      data: dates.map((d) => d.slice(5)),
      axisLabel: { color: '#8aa4be' },
      axisLine: { lineStyle: { color: 'rgba(0,180,255,0.3)' } },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#8aa4be', formatter: (v) => v >= 10000 ? (v / 10000).toFixed(0) + 'w' : v },
      splitLine: { lineStyle: { color: 'rgba(0,180,255,0.1)' } },
    },
    series: [
      {
        name: '曝光量',
        type: 'line',
        data: exposures,
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0,180,255,0.4)' },
            { offset: 1, color: 'rgba(0,180,255,0.02)' },
          ]),
        },
        lineStyle: { color: '#00b4ff', width: 2 },
        itemStyle: { color: '#00b4ff' },
      },
      {
        name: '观看人数',
        type: 'line',
        data: viewers,
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,200,0,0.4)' },
            { offset: 1, color: 'rgba(255,200,0,0.02)' },
          ]),
        },
        lineStyle: { color: '#ffc800', width: 2 },
        itemStyle: { color: '#ffc800' },
      },
    ],
  })
}

async function fetchMediaChart() {
  const data = await getMediaDistribution()

  platformData.value = data.map((d) => ({
    platform: d.platform,
    totalReadCount: Number(d.totalReadCount) || 0,
    totalLikeCount: Number(d.totalLikeCount) || 0,
    totalCommentCount: Number(d.totalCommentCount) || 0,
  }))

  const pieData = data.map((d) => ({
    name: d.platform,
    value: Number(d.totalReadCount) || 0,
  }))

  mediaChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '55%'],
        data: pieData,
        label: {
          color: '#8aa4be',
          fontSize: 12,
        },
        itemStyle: {
          borderColor: '#0d1b3e',
          borderWidth: 2,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
    color: ['#00b4ff', '#ffc800', '#7b68ee', '#ff6b6b', '#36d1dc', '#f7971e', '#00ff88'],
  })
}

async function fetchTrendChart() {
  const data = await getDashboardTrend(7)

  const douyinDates = (data.douyin || []).map((d) => (d.date || '').slice(5))
  const douyinPlays = (data.douyin || []).map((d) => Number(d.playCount) || 0)
  const mediaDates = (data.media || []).map((d) => (d.date || '').slice(5))
  const mediaReads = (data.media || []).map((d) => Number(d.readCount) || 0)

  const allDates = [...new Set([...douyinDates, ...mediaDates])].sort()

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#aaa' }, top: 0 },
    grid: { left: 50, right: 16, bottom: 30, top: 40 },
    xAxis: {
      type: 'category',
      data: allDates,
      axisLabel: { color: '#8aa4be' },
      axisLine: { lineStyle: { color: 'rgba(0,180,255,0.3)' } },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#8aa4be', formatter: (v) => v >= 10000 ? (v / 10000).toFixed(0) + 'w' : v },
      splitLine: { lineStyle: { color: 'rgba(0,180,255,0.1)' } },
    },
    series: [
      {
        name: '抖音播放量',
        type: 'line',
        data: allDates.map((d) => {
          const idx = douyinDates.indexOf(d)
          return idx >= 0 ? douyinPlays[idx] : 0
        }),
        smooth: true,
        lineStyle: { color: '#00b4ff', width: 2 },
        itemStyle: { color: '#00b4ff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0,180,255,0.3)' },
            { offset: 1, color: 'rgba(0,180,255,0.02)' },
          ]),
        },
      },
      {
        name: '自媒体阅读量',
        type: 'line',
        data: allDates.map((d) => {
          const idx = mediaDates.indexOf(d)
          return idx >= 0 ? mediaReads[idx] : 0
        }),
        smooth: true,
        lineStyle: { color: '#f7971e', width: 2 },
        itemStyle: { color: '#f7971e' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(247,151,30,0.3)' },
            { offset: 1, color: 'rgba(247,151,30,0.02)' },
          ]),
        },
      },
    ],
  })
}

async function fetchRankings() {
  const data = await getDashboardRankings()
  mediaRanking.value = data.mediaRanking || []
}

function generateRealtimeData() {
  const types = [
    { tag: '抖音', type: 'douyin', accounts: ['遇见约到家官方', '遇见约到家生活号', '遇见到家精选'] },
    { tag: '快手', type: 'kuaishou', accounts: ['快手直播'] },
    { tag: '知乎', type: 'media', accounts: ['知乎文章'] },
    { tag: '头条', type: 'media', accounts: ['今日头条'] },
    { tag: '百家号', type: 'media', accounts: ['百家号'] },
  ]

  const items = []
  for (let i = 0; i < 15; i++) {
    const t = types[Math.floor(Math.random() * types.length)]
    const account = t.accounts[Math.floor(Math.random() * t.accounts.length)]
    const metrics = t.type === 'douyin'
      ? ['播放', '点赞', '评论']
      : t.type === 'kuaishou'
        ? ['曝光', '观看']
        : ['阅读', '点赞']
    const metric = metrics[Math.floor(Math.random() * metrics.length)]
    const value = Math.floor(Math.random() * 5000) + 100

    items.push({
      tag: t.tag,
      type: t.type,
      text: `${account} ${metric}`,
      value: value.toLocaleString(),
    })
  }

  realtimeData.value = items
}

async function fetchAll() {
  try {
    await Promise.all([
      fetchSummary(),
      fetchDouyinChart(),
      fetchKuaishouChart(),
      fetchMediaChart(),
      fetchTrendChart(),
      fetchRankings(),
    ])
  } catch (e) {
    console.error('数据加载失败:', e)
  }
}

onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize)
  updateTime()
  timer = setInterval(updateTime, 1000)

  await nextTick()
  initCharts()

  generateRealtimeData()
  setInterval(generateRealtimeData, 10000)

  await fetchAll()
  setInterval(fetchAll, 30000)

  socket = io(window.location.origin, { path: '/socket.io' })
  socket.on('data_update', () => {
    fetchAll()
  })
  socket.on('connect', () => {
    console.log('WebSocket 已连接')
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (timer) clearInterval(timer)
  socket?.disconnect()
  douyinChart?.dispose()
  kuaishouChart?.dispose()
  mediaChart?.dispose()
  trendChart?.dispose()
})
</script>

<style scoped>
.screen-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #020510;
}

.screen {
  width: 1920px;
  height: 1080px;
  position: fixed;
  top: 0;
  left: 0;
  background: radial-gradient(ellipse at center, #0d1b3e 0%, #060e24 70%, #020510 100%);
  overflow: hidden;
}

.screen-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  background: linear-gradient(180deg, rgba(0, 180, 255, 0.15) 0%, transparent 100%);
  border-bottom: 1px solid rgba(0, 180, 255, 0.2);
  margin-bottom: 10px;
  flex-shrink: 0;
}

.header-title {
  font-size: 26px;
  font-weight: bold;
  background: linear-gradient(90deg, #00d4ff, #7b68ee, #00d4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 6px;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #8aa4be;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00ff88;
  margin-right: 8px;
  animation: pulse 2s infinite;
  box-shadow: 0 0 6px #00ff88;
}

.time {
  font-size: 16px;
  color: #00d4ff;
  font-family: 'Courier New', monospace;
}

.main {
  display: flex;
  flex: 1;
  gap: 10px;
  min-height: 0;
}

.col-left {
  width: 360px;
  display: flex;
  flex-direction: column;
}

.col-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.col-right {
  width: 340px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  overflow: hidden;
}

.core-kpi-panel {
  flex-shrink: 0;
}

.core-kpi-main {
  margin-bottom: 14px;
}

.core-kpi-item.primary {
  text-align: center;
  padding: 18px 16px;
  background: linear-gradient(135deg, rgba(0, 180, 255, 0.12) 0%, rgba(123, 104, 238, 0.08) 100%);
  border: 1px solid rgba(0, 180, 255, 0.25);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.core-kpi-item.primary::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(0, 180, 255, 0.06) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.core-kpi-item.primary .core-kpi-label {
  font-size: 16px;
  color: #8aa4be;
  margin-bottom: 8px;
  position: relative;
}

.core-number {
  font-size: 52px !important;
  font-weight: bold;
  color: #00d4ff !important;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.6), 0 0 40px rgba(0, 212, 255, 0.3) !important;
  position: relative;
}

.core-kpi-sub {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
  position: relative;
  flex-wrap: wrap;
}

.sub-item {
  font-size: 12px;
  color: #8aa4be;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.sub-icon {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sub-icon.douyin { background: #00b4ff; }
.sub-icon.kuaishou { background: #ffc800; }
.sub-icon.media { background: #7b68ee; }

.core-kpi-row {
  display: flex;
  gap: 10px;
}

.core-kpi-row .core-kpi-item {
  flex: 1;
  text-align: center;
  padding: 10px 6px;
  background: rgba(0, 180, 255, 0.05);
  border: 1px solid rgba(0, 180, 255, 0.15);
  border-radius: 6px;
  overflow: hidden;
}

.core-kpi-row .core-kpi-label {
  font-size: 12px;
  color: #8aa4be;
  margin-bottom: 4px;
}

.realtime-list {
  height: 180px;
  overflow: hidden;
}

.realtime-item {
  display: flex;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid rgba(0, 180, 255, 0.08);
  font-size: 12px;
}

.realtime-tag {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  margin-right: 6px;
  flex-shrink: 0;
}

.realtime-tag.douyin { background: rgba(0, 180, 255, 0.2); color: #00b4ff; }
.realtime-tag.kuaishou { background: rgba(255, 200, 0, 0.2); color: #ffc800; }
.realtime-tag.media { background: rgba(123, 104, 238, 0.2); color: #7b68ee; }

.realtime-text {
  flex: 1;
  color: #8aa4be;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.realtime-value {
  color: #00ff88;
  font-weight: bold;
  margin-left: 6px;
  flex-shrink: 0;
  white-space: nowrap;
}

.footer {
  display: flex;
  gap: 10px;
  height: 200px;
  margin-top: 10px;
  flex-shrink: 0;
}

.footer-col {
  flex: 1;
  min-width: 0;
}

.scroll-wrap {
  height: 150px;
  overflow: hidden;
  position: relative;
}

.scroll-inner {
  display: flex;
  flex-direction: column;
}

.scroll-inner.scrolling {
  animation: scrollUp 20s linear infinite;
}

.scroll-inner.scrolling:hover {
  animation-play-state: paused;
}

.scroll-gap {
  height: 10px;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 5px 0;
  font-size: 13px;
  border-bottom: 1px solid rgba(0, 180, 255, 0.06);
}

.rank-index {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: rgba(0, 180, 255, 0.1);
  color: #8aa4be;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  margin-right: 8px;
  flex-shrink: 0;
}

.rank-index.top {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
}

.rank-index.platform-idx {
  background: rgba(123, 104, 238, 0.2);
  color: #7b68ee;
}

.rank-index.platform-idx.top {
  background: linear-gradient(135deg, #7b68ee, #667eea);
  color: #fff;
}

.rank-title {
  flex: 1;
  color: #d4e5ff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.rank-value {
  color: #00d4ff;
  font-weight: bold;
  margin-left: 8px;
  flex-shrink: 0;
  white-space: nowrap;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

@keyframes scrollUp {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
</style>
