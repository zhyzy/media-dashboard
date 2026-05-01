<template>
  <span class="count-up">{{ displayValue }}</span>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  duration: { type: Number, default: 2000 },
})

const displayValue = ref('0')

function animateCount(target) {
  const start = 0
  const startTime = performance.now()
  const diff = target - start

  function update(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = Math.floor(start + diff * eased)
    displayValue.value = current.toLocaleString()

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}

watch(() => props.value, (newVal) => {
  animateCount(newVal)
})

onMounted(() => {
  animateCount(props.value)
})
</script>

<style scoped>
.count-up {
  font-size: 32px;
  font-weight: bold;
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}
</style>
