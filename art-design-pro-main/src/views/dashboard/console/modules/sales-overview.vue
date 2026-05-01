<template>
  <div class="art-card h-105 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>浏览量概览</h4>
        <p>各平台总播放/浏览量趋势</p>
      </div>
    </div>
    <ArtLineChart
      height="calc(100% - 56px)"
      :data="lineData"
      :xAxisData="xAxisLabels"
      :showAreaColor="true"
      :showAxisLine="false"
      :showLegend="true"
      legendPosition="bottom"
    />
  </div>
</template>

<script setup lang="ts">
  import { fetchDashboardTrend } from '@/api/dashboard'

  const xAxisLabels = ref<string[]>([])
  const lineData = ref<any[]>([])

  onMounted(async () => {
    try {
      const trendRes: any = await fetchDashboardTrend(14)

      const platforms: { key: string; name: string; field: string }[] = [
        { key: 'douyin', name: '抖音', field: 'playCount' },
        { key: 'kuaishou', name: '快手', field: 'playCount' },
        { key: 'videoAccount', name: '视频号', field: 'playCount' },
        { key: 'media', name: '自媒体', field: 'readCount' },
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

      lineData.value = platforms.map(p => {
        const items = trendRes[p.key] || []
        const data = sortedDates.map(date => {
          const match = items.find((item: any) => item.date && item.date.split('T')[0] === date)
          return match ? Number(match[p.field] || 0) : 0
        })
        return { name: p.name, data, showAreaColor: true }
      })
    } catch (e) {
      console.error(e)
    }
  })
</script>
