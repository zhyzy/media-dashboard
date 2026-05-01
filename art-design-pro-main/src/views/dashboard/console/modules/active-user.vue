<template>
  <div class="art-card h-105 p-4 box-border mb-5 max-sm:mb-4">
    <ArtBarChart
      class="box-border p-2"
      barWidth="50%"
      height="13.7rem"
      :showAxisLine="false"
      :data="chartData"
      :xAxisData="xAxisLabels"
    />
    <div class="ml-1">
      <h3 class="mt-5 text-lg font-medium">流量概览</h3>
      <p class="mt-1 text-sm">记录平台各渠道的流量变化趋势，掌握流量动态</p>
    </div>
    <div class="flex-b mt-2">
      <div class="flex-1" v-for="(item, index) in list" :key="index">
        <p class="text-2xl text-g-900">{{ item.num }}</p>
        <p class="text-xs text-g-500">{{ item.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { fetchDashboardSummary, fetchDashboardTrend } from '@/api/dashboard'

  interface UserStatItem {
    name: string
    num: string
  }

  const xAxisLabels = ref<string[]>([])
  const chartData = ref<number[]>([])

  const list = ref<UserStatItem[]>([
    { name: '抖音', num: '0' },
    { name: '快手', num: '0' },
    { name: '视频号', num: '0' },
    { name: '自媒体', num: '0' }
  ])

  onMounted(async () => {
    try {
      const [summaryRes, trendRes] = await Promise.all([
        fetchDashboardSummary(),
        fetchDashboardTrend(14)
      ])

      list.value = [
        { name: '抖音', num: formatNum(summaryRes.douyin.totalPlayCount || 0) },
        { name: '快手', num: formatNum(summaryRes.kuaishou.totalPlayCount || 0) },
        { name: '视频号', num: formatNum(summaryRes.videoAccount.totalPlayCount || 0) },
        { name: '自媒体', num: formatNum(summaryRes.media.totalReadCount || 0) },
      ]

      const platforms: { key: string; field: string }[] = [
        { key: 'douyin', field: 'playCount' },
        { key: 'kuaishou', field: 'playCount' },
        { key: 'videoAccount', field: 'playCount' },
        { key: 'media', field: 'readCount' },
      ]

      const allDates = new Set<string>()
      platforms.forEach(p => {
        const items = trendRes[p.key] || []
        items.forEach((item: any) => {
          const dateOnly = item.date ? item.date.split('T')[0] : ''
          if (dateOnly) allDates.add(dateOnly)
        })
      })

      const sortedDates = Array.from(allDates).sort()
      xAxisLabels.value = sortedDates.map(d => {
        const parts = d.split('-')
        return `${parts[1]}/${parts[2]}`
      })

      const dailyTotals = sortedDates.map(date => {
        let total = 0
        platforms.forEach(p => {
          const items = trendRes[p.key] || []
          const match = items.find((item: any) => item.date && item.date.split('T')[0] === date)
          if (match) {
            total += Number(match[p.field] || 0)
          }
        })
        return total
      })

      chartData.value = dailyTotals
    } catch (e) {
      console.error(e)
    }
  })

  function formatNum(n: number): string {
    if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
    return String(n)
  }
</script>
