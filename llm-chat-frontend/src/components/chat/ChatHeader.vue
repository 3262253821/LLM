<script setup lang="ts">
import ThemeDropdown from '@/components/chat/ThemeDropdown.vue'

interface Props {
  title: string
  messageCount: number
  loading: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'clear-session'): void
}>()

function onClear() {
  emit('clear-session')
}
</script>

<template>
  <div class="chat-header">
    <div class="chat-header__left">
      <h3 class="chat-header__title">{{ title }}</h3>
      <p class="chat-header__meta">
        消息数：{{ messageCount }} <span v-if="loading">· AI 正在思考...</span>
      </p>
    </div>
    <div class="chat-header__right">
      <ThemeDropdown />
      <button class="chat-header__clear-btn" @click="onClear">清空当前会话</button>
    </div>
  </div>
</template>

<style scoped>
.chat-header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.chat-header__title {
  margin: 0;
  font-size: 16px;
  color: var(--app-text-primary);
}

.chat-header__meta {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--app-text-secondary);
}

.chat-header__right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-header__clear-btn {
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-primary);
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
}
</style>
