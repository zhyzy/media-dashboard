<!-- 通知组件 -->
<template>
  <div
    class="art-notification-panel art-card-sm !shadow-xl"
    :style="{
      transform: show ? 'scaleY(1)' : 'scaleY(0.9)',
      opacity: show ? 1 : 0
    }"
    v-show="visible"
    @click.stop
  >
    <div class="flex-cb px-3.5 mt-3.5">
      <span class="text-base font-medium text-g-800">数据录入动态</span>
      <span class="text-xs text-g-800 px-1.5 py-1 c-p select-none rounded hover:bg-g-200">
        今日新增 +{{ recordList.length }} 条
      </span>
    </div>

    <div class="w-full h-[calc(100%-65px)]">
      <div class="h-[calc(100%-30px)] overflow-y-scroll scrollbar-thin">
        <div
          class="h-17.5 leading-17.5 border-b border-g-300 text-sm overflow-hidden last:border-b-0 px-3.5 py-3.5"
          v-for="(item, index) in recordList"
          :key="index"
        >
          <span class="text-g-800 font-medium">{{ item.username }}</span>
          <span class="mx-2 text-g-600">{{ item.action }}</span>
          <span class="text-theme">{{ item.target }}</span>
          <span class="text-g-500 text-xs ml-2">({{ item.time }})</span>
        </div>

        <div
          v-show="recordList.length === 0"
          class="relative top-25 h-full text-g-500 text-center !bg-transparent"
        >
          <ArtSvgIcon icon="system-uicons:inbox" class="text-5xl" />
          <p class="mt-3.5 text-xs !bg-transparent">暂无数据录入动态</p>
        </div>
      </div>
    </div>

    <div class="h-25"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, type Ref } from 'vue'
  import { fetchActivityRecent } from '@/api/activity'

  defineOptions({ name: 'ArtNotification' })

  interface RecordItem {
    id: number
    username: string
    action: string
    target: string
    time: string
  }

  const props = defineProps<{
    value: boolean
  }>()

  const emit = defineEmits<{
    'update:value': [value: boolean]
  }>()

  const show = ref(false)
  const visible = ref(false)
  const recordList = ref<RecordItem[]>([])

  const loadRecords = async () => {
    try {
      const data: any = await fetchActivityRecent()
      recordList.value = []
      data.forEach((item: any) => {
        const dt = new Date(item.createTime)
        const dateStr = `${dt.getMonth() + 1}/${dt.getDate()}`
        const timeStr = dt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        recordList.value.push({
          id: item.id,
          username: item.staffName,
          action: item.action,
          target: item.target,
          time: `${dateStr} ${timeStr}`,
        })
      })
    } catch (err) {
      console.error('加载动态记录失败', err)
    }
  }

  const showNotice = (open: boolean) => {
    if (open) {
      loadRecords()
      visible.value = true
      setTimeout(() => {
        show.value = true
      }, 5)
    } else {
      show.value = false
      setTimeout(() => {
        visible.value = false
      }, 350)
    }
  }

  watch(
    () => props.value,
    (newValue) => {
      showNotice(newValue)
    }
  )

  onMounted(() => {
    loadRecords()
  })
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .art-notification-panel {
    @apply absolute 
    top-14.5 
    right-5 
    w-90 
    h-100 
    overflow-hidden 
    transition-all 
    duration-300
    origin-top 
    will-change-[top,left] 
    max-[640px]:top-[65px]
    max-[640px]:right-0
    max-[640px]:w-full 
    max-[640px]:h-[80vh];
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 5px !important;
  }

  .dark .scrollbar-thin::-webkit-scrollbar-track {
    background-color: var(--default-box-color);
  }

  .dark .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #222 !important;
  }
</style>
