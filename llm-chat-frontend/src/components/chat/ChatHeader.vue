<script setup lang="ts">
import ThemeDropdown from '@/components/chat/ThemeDropdown.vue'

interface Props {
  title: string
  messageCount: number
  loading: boolean
  syncing: boolean
  modelLabel: string
  isMobile: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'clear-session'): void
  (e: 'toggle-sidebar'): void
}>()

function onClear() {
  emit('clear-session')
}

function toggleSidebar() {
  emit('toggle-sidebar')
}
</script>

<template>
  <div class="chat-header">
    <div class="chat-header__left">
      <button
        v-if="isMobile"
        class="chat-header__menu-btn"
        type="button"
        aria-label="打开会话列表"
        @click="toggleSidebar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M4 7H20" />
          <path d="M4 12H20" />
          <path d="M4 17H14" />
        </svg>
      </button>

      <div class="chat-header__title-wrap">
        <p class="chat-header__eyebrow">LLM Workspace</p>
        <div class="chat-header__title-row">
          <h3 class="chat-header__title">{{ title }}</h3>
          <span
            class="chat-header__status"
            :class="{
              'is-loading': loading,
              'is-syncing': !loading && syncing,
            }"
          >
            {{ loading ? '生成中' : syncing ? '同步中' : '已就绪' }}
          </span>
        </div>
        <p class="chat-header__meta">
          <span>{{ messageCount }} 条消息</span>
          <span>{{ modelLabel }}</span>
          <span>支持 Markdown / 代码高亮</span>
        </p>
      </div>
    </div>

    <div class="chat-header__right">
      <ThemeDropdown />
      <button class="chat-header__clear-btn" type="button" @click="onClear">清空会话</button>
    </div>
  </div>
</template>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 100%;
  padding: 16px 22px;
}

.chat-header__left {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.chat-header__menu-btn {
  width: 42px;
  height: 42px;
  border: 1px solid var(--app-border);
  border-radius: 14px;
  background: var(--app-surface-elevated);
  color: var(--app-text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.chat-header__menu-btn svg {
  width: 18px;
  height: 18px;
}

.chat-header__title-wrap {
  min-width: 0;
}

.chat-header__eyebrow {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--app-text-tertiary);
}

.chat-header__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.chat-header__title {
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 24px;
  line-height: 1.1;
  color: var(--app-text-primary);
  font-family: var(--app-display-font);
}

.chat-header__status {
  flex-shrink: 0;
  border: 1px solid rgba(15, 118, 110, 0.18);
  border-radius: 999px;
  padding: 6px 11px;
  background: rgba(15, 118, 110, 0.08);
  color: var(--app-primary);
  font-size: 12px;
}

.chat-header__status.is-loading {
  border-color: rgba(249, 115, 22, 0.2);
  background: rgba(249, 115, 22, 0.12);
  color: var(--app-warning);
}

.chat-header__status.is-syncing {
  border-color: rgba(37, 99, 235, 0.18);
  background: rgba(37, 99, 235, 0.1);
  color: var(--app-info);
}

.chat-header__meta {
  margin: 8px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  font-size: 12px;
  color: var(--app-text-secondary);
}

.chat-header__meta span {
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.42);
  border: 1px solid rgba(15, 23, 42, 0.05);
}

.chat-header__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.chat-header__clear-btn {
  border: 1px solid var(--app-border);
  background: var(--app-surface-elevated);
  color: var(--app-text-primary);
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    background-color 0.2s ease;
}

.chat-header__clear-btn:hover {
  border-color: rgba(220, 38, 38, 0.16);
  background: rgba(220, 38, 38, 0.08);
  transform: translateY(-1px);
}

@media (max-width: 960px) {
  .chat-header {
    padding: 16px 18px;
  }

  .chat-header__title {
    font-size: 20px;
  }
}

@media (max-width: 640px) {
  .chat-header {
    align-items: flex-start;
    padding: 14px 14px 16px;
  }

  .chat-header__title-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .chat-header__right {
    gap: 8px;
  }

  .chat-header__clear-btn {
    padding: 9px 12px;
    font-size: 13px;
  }
}
</style>
