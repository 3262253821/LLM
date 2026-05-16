import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { throttle } from '@/utils/performance'

export function useViewport(breakpoint = 960) {
  const width = ref(typeof window === 'undefined' ? breakpoint + 1 : window.innerWidth)

  const syncViewport = throttle(() => {
    width.value = window.innerWidth
  }, 120)

  onMounted(() => {
    syncViewport()
    window.addEventListener('resize', syncViewport, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', syncViewport)
    syncViewport.cancel()
  })

  return {
    width,
    isMobile: computed(() => width.value <= breakpoint),
  }
}
