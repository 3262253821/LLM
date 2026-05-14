<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

interface Props {
  content: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})
// 响应式变量 copied 用于记录是否已复制
const copied = ref(false)
// 记录定时器id，点了复制后过段时间才能再次点击复制
let timer: number | null = null

const buttonTitle = computed(() => {
  if (props.disabled) return '暂时无法复制'
  return copied.value ? '已复制' : '复制'
})

async function handleCopy() {
  if (props.disabled || !props.content) return

  try {
    // navigator.clipboard是浏览器提供的 API，用于操作剪贴板
    // 可以使用 writeText 方法将后面的 props.content 内容写入剪贴板
    await navigator.clipboard.writeText(props.content)
    copied.value = true

    if (timer !== null) {
      window.clearTimeout(timer)
    }

    timer = window.setTimeout(() => {
      copied.value = false
      timer = null
    }, 1500)
  } catch (error) {
    console.error('复制失败', error)
    window.alert('复制失败，请检查浏览器是否允许访问剪贴板')
  }
}
// 钩子函数 onBeforeUnmount 用于在组件卸载前执行定时器清除操作
onBeforeUnmount(() => {
  if (timer !== null) {
    window.clearTimeout(timer)
  }
})
</script>

<template>
  <button
    type="button"
    class="copy-button"
    :disabled="props.disabled"
    :title="buttonTitle"
    :aria-label="buttonTitle"
    @click="handleCopy"
  >
    <svg
      class="copy-button__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path
        d="M9 9.75C9 8.50736 10.0074 7.5 11.25 7.5H17.25C18.4926 7.5 19.5 8.50736 19.5 9.75V15.75C19.5 16.9926 18.4926 18 17.25 18H11.25C10.0074 18 9 16.9926 9 15.75V9.75Z"
      />
      <path
        d="M15 7.5V6.75C15 5.50736 13.9926 4.5 12.75 4.5H6.75C5.50736 4.5 4.5 5.50736 4.5 6.75V12.75C4.5 13.9926 5.50736 15 6.75 15H7.5"
      />
    </svg>

    <span class="copy-button__text">
      {{ copied ? '已复制' : '复制' }}
    </span>
  </button>
</template>

<style scoped>
.copy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.copy-button:hover {
  color: #475569;
  background: #f1f5f9;
}

.copy-button:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.copy-button__icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.copy-button__text {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
