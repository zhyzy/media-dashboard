<template>
  <ElRow :gutter="20" class="flex">
    <ElCol v-for="(item, index) in dataList" :key="index" :sm="12" :md="6" :lg="6">
      <div class="art-card relative flex flex-col justify-center h-35 px-5 mb-5 max-sm:mb-4">
        <span class="text-g-700 text-sm">{{ item.des }}</span>
        <ArtCountTo class="text-[26px] font-medium mt-2" :target="item.num" :duration="1300" />
        <div class="flex-c mt-1">
          <span class="text-xs text-g-600">较上周</span>
          <span
            class="ml-1 text-xs font-semibold"
            :class="[item.change.indexOf('+') === -1 ? 'text-danger' : 'text-success']"
          >
            {{ item.change }}
          </span>
        </div>
        <div
          class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc bg-theme/10"
        >
          <ArtSvgIcon :icon="item.icon" class="text-xl text-theme" />
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { onMounted, reactive } from 'vue'
  import { fetchDashboardSummary, fetchDashboardTrend } from '@/api/dashboard'

  interface CardDataItem {
    des: string
    icon: string
    startVal: number
    duration: number
    num: number
    change: string
  }

  const dataList = reactive<CardDataItem[]>([
    {
      des: '总播放/浏览',
      icon: 'ri:play-line',
      startVal: 0,
      duration: 1000,
      num: 0,
      change: '0%'
    },
    {
      des: '总点赞',
      icon: 'ri:heart-line',
      startVal: 0,
      duration: 1000,
      num: 0,
      change: '0%'
    },
    {
      des: '总评论',
      icon: 'ri:chat-1-line',
      startVal: 0,
      duration: 1000,
      num: 0,
      change: '0%'
    },
    {
      des: '总转发',
      icon: 'ri:share-line',
      startVal: 0,
      duration: 1000,
      num: 0,
      change: '0%'
    }
  ])

  const calcChange = (thisWeek: number, lastWeek: number): string => {
    if (lastWeek === 0) return thisWeek > 0 ? '+100%' : '0%'
    const pct = ((thisWeek - lastWeek) / lastWeek * 100).toFixed(0)
    return Number(pct) >= 0 ? `+${pct}%` : `${pct}%`
  }

  const sumField = (items: any[], field: string): number => {
    return items.reduce((sum, item) => sum + Number(item[field] || 0), 0)
  }

  const loadData = async () => {
    try {
      const [summary, trendRes]: [any, any] = await Promise.all([
        fetchDashboardSummary(),
        fetchDashboardTrend(14)
      ])

      dataList[0].num = (summary.totalPlayCount || 0) + (summary.totalReadCount || 0)
      dataList[1].num = summary.totalLikeCount || 0
      dataList[2].num = summary.totalCommentCount || 0
      dataList[3].num = summary.totalShareCount || 0

      const today = new Date()
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      const twoWeeksAgo = new Date(today)
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

      const isInWeek = (dateStr: string, start: Date, end: Date) => {
        const d = new Date(dateStr)
        return d >= start && d < end
      }

      const platforms = ['douyin', 'kuaishou', 'videoAccount', 'media', 'live']

      let thisWeekPlay = 0, lastWeekPlay = 0
      let thisWeekLike = 0, lastWeekLike = 0
      let thisWeekComment = 0, lastWeekComment = 0
      let thisWeekShare = 0, lastWeekShare = 0

      platforms.forEach(key => {
        const items = trendRes[key] || []
        items.forEach((item: any) => {
          const dateStr = item.date
          const isThisWeek = isInWeek(dateStr, weekAgo, today)
          const isLastWeek = isInWeek(dateStr, twoWeeksAgo, weekAgo)

          if (isThisWeek) {
            thisWeekPlay += Number(item.playCount || item.readCount || 0)
            thisWeekLike += Number(item.likeCount || 0)
            thisWeekComment += Number(item.commentCount || 0)
            thisWeekShare += Number(item.shareCount || 0)
          }
          if (isLastWeek) {
            lastWeekPlay += Number(item.playCount || item.readCount || 0)
            lastWeekLike += Number(item.likeCount || 0)
            lastWeekComment += Number(item.commentCount || 0)
            lastWeekShare += Number(item.shareCount || 0)
          }
        })
      })

      dataList[0].change = calcChange(thisWeekPlay, lastWeekPlay)
      dataList[1].change = calcChange(thisWeekLike, lastWeekLike)
      dataList[2].change = calcChange(thisWeekComment, lastWeekComment)
      dataList[3].change = calcChange(thisWeekShare, lastWeekShare)
    } catch (err) {
      console.error('加载统计数据失败', err)
    }
  }

  onMounted(() => {
    loadData()
  })
</script>
