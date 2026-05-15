<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import MessageCopyButton from '@/components/chat/message/MessageCopyButton.vue'
import MessageMarkdown from '@/components/chat/message/MessageMarkdown.vue'
import MessageRegenerateButton from '@/components/chat/message/MessageRegenerateButton.vue'
import type { MessageItem } from '@/types/chat'

interface Props {
  messages: MessageItem[]
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'regenerate-message', messageId: number): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)

function canShowRegenerate(item: MessageItem, index: number) {
  const previousMessage = props.messages[index - 1]

  return (
    item.role === 'assistant' &&
    !props.loading &&
    index === props.messages.length - 1 &&
    previousMessage?.role === 'user'
  )
}

watch(
  () => [props.messages.length, props.messages.at(-1)?.content, props.loading],
  async () => {
    await nextTick()
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  },
  { immediate: true },
)
</script>

<template>
  <div ref="containerRef" class="message-list">
    <div v-if="props.messages.length === 0" class="message-list__empty">
      还没有消息，先发一句试试吧。
    </div>

    <div
      v-for="(item, index) in props.messages"
      :key="item.id"
      class="message-row"
      :class="{ 'is-user': item.role === 'user' }"
    >
      <div class="message-bubble" :class="{ 'is-user-bubble': item.role === 'user' }">
        <div class="message-role">{{ item.role === 'user' ? '你' : 'AI' }}</div>

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
  </div>
</template>

<style scoped>
.message-list {
  height: 100%;
  overflow: auto;
  padding: 16px;
}

.message-list__empty {
  color: var(--app-text-tertiary);
  text-align: center;
  margin-top: 40px;
}

.message-row {
  display: flex;
  margin-bottom: 12px;
}

.message-row.is-user {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 10px 12px;
}

.message-bubble.is-user-bubble {
  background: var(--app-success-soft);
  border-color: var(--app-success);
}

.message-role {
  font-size: 12px;
  color: var(--app-text-secondary);
  margin-bottom: 6px;
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
  margin-top: 8px;
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
</style>
