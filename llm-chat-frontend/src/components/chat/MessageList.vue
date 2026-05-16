<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import MessageCopyButton from '@/components/chat/message/MessageCopyButton.vue'
import MessageMarkdown from '@/components/chat/message/MessageMarkdown.vue'
import MessageRegenerateButton from '@/components/chat/message/MessageRegenerateButton.vue'
import type { MessageItem } from '@/types/chat'
import { throttle } from '@/utils/performance'

interface Props {
  messages: MessageItem[]
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'regenerate-message', messageId: number): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const stickToBottom = ref(true)

const showJumpButton = computed(() => !stickToBottom.value && props.messages.length > 5)

const updateScrollState = throttle(() => {
  const container = containerRef.value

  if (!container) return

  const distanceToBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight

  stickToBottom.value = distanceToBottom < 96
}, 120)

const syncToBottom = throttle(() => {
  const container = containerRef.value

  if (!container) return

  container.scrollTop = container.scrollHeight
}, 80)

function canShowRegenerate(item: MessageItem, index: number) {
  const previousMessage = props.messages[index - 1]

  return (
    item.role === 'assistant' &&
    !props.loading &&
    index === props.messages.length - 1 &&
    previousMessage?.role === 'user'
  )
}

function handleScroll() {
  updateScrollState()
}

function jumpToBottom() {
  const container = containerRef.value

  if (!container) return

  container.scrollTo({
    top: container.scrollHeight,
    behavior: 'smooth',
  })

  stickToBottom.value = true
}

watch(
  () => [props.messages.length, props.messages.at(-1)?.content],
  async () => {
    await nextTick()
    updateScrollState.flush()

    const lastMessage = props.messages.at(-1)

    if (lastMessage?.role === 'user') {
      stickToBottom.value = true
    }

    if (stickToBottom.value) {
      syncToBottom()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  updateScrollState.cancel()
  syncToBottom.cancel()
})
</script>

<template>
  <div ref="containerRef" class="message-list" @scroll="handleScroll">
    <div v-if="props.messages.length === 0" class="message-list__empty">
      <div class="message-list__empty-card">
        <h2 class="message-list__empty-title">欢迎使用 LLM 对话平台</h2>
        <p class="message-list__empty-desc">在下方输入你的问题、任务或指令，开始新的对话。</p>
      </div>
    </div>

    <div
      v-for="(item, index) in props.messages"
      :key="item.id"
      class="message-row"
      :class="{ 'is-user': item.role === 'user' }"
    >
      <div class="message-bubble" :class="{ 'is-user-bubble': item.role === 'user' }">
        <div class="message-role">{{ item.role === 'user' ? '你' : 'AI 助手' }}</div>

        <div v-if="item.role === 'user'" class="message-content">
          {{ item.content }}
        </div>

        <MessageMarkdown v-else :content="item.content" />

        <div class="message-footer">
          <div class="message-actions">
            <MessageCopyButton
              :content="item.content"
              :disabled="item.role === 'assistant' && item.content === '正在思考中...'"
            />

            <MessageRegenerateButton
              v-if="canShowRegenerate(item, index)"
              @click="emit('regenerate-message', item.id)"
            />
          </div>

          <div class="message-time">{{ item.time }}</div>
        </div>
      </div>
    </div>

    <button v-if="showJumpButton" class="message-list__jump-btn" type="button" @click="jumpToBottom">
      回到底部
    </button>
  </div>
</template>

<style scoped>
.message-list {
  position: relative;
  height: 100%;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 22px 22px 28px;
}

.message-list__empty {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-list__empty-card {
  width: min(620px, 100%);
  padding: 36px 30px;
  border-radius: 30px;
  border: 1px solid var(--app-border);
  background:
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.12), transparent 24%),
    radial-gradient(circle at bottom left, rgba(249, 115, 22, 0.12), transparent 24%),
    var(--app-surface-elevated);
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);
  text-align: center;
}

.message-list__empty-title {
  margin: 0;
  font-size: 36px;
  line-height: 1.05;
  color: var(--app-text-primary);
  font-family: var(--app-display-font);
}

.message-list__empty-desc {
  margin: 14px auto 0;
  max-width: 420px;
  color: var(--app-text-secondary);
  line-height: 1.6;
}

.message-row {
  display: flex;
  margin-bottom: 16px;
}

.message-row.is-user {
  justify-content: flex-end;
}

.message-bubble {
  max-width: min(76%, 780px);
  background: var(--app-surface-elevated);
  border: 1px solid var(--app-border);
  border-radius: 24px;
  padding: 16px 18px;
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.06);
}

.message-bubble.is-user-bubble {
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.12), rgba(255, 255, 255, 0.92)),
    var(--app-surface-elevated);
  border-color: rgba(15, 118, 110, 0.18);
}

.message-role {
  margin-bottom: 10px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--app-text-secondary);
}

.message-content {
  color: var(--app-text-primary);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-time {
  font-size: 11px;
  color: var(--app-text-tertiary);
}

.message-list__jump-btn {
  position: sticky;
  left: calc(100% - 136px);
  bottom: 18px;
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 112px;
  height: 42px;
  border: 1px solid rgba(15, 118, 110, 0.16);
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.88);
  color: #fff;
  box-shadow: 0 20px 34px rgba(15, 118, 110, 0.22);
  cursor: pointer;
}

@media (max-width: 960px) {
  .message-list {
    padding: 18px 16px 24px;
  }

  .message-bubble {
    max-width: 86%;
  }
}

@media (max-width: 640px) {
  .message-list {
    padding: 14px 12px 20px;
  }

  .message-list__empty-card {
    padding: 22px 18px;
    border-radius: 22px;
  }

  .message-list__empty-title {
    font-size: 30px;
  }

  .message-bubble {
    max-width: 94%;
    border-radius: 20px;
    padding: 14px 15px;
  }

  .message-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .message-list__jump-btn {
    min-width: 102px;
    bottom: 10px;
  }
}
</style>
