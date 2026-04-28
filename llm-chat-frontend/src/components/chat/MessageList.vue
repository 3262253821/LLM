<script setup lang="ts">
// nextTick 确保在 DOM 更新完成后执行滚动操作
import { nextTick, ref, watch } from 'vue'
import type { MessageItem } from '@/types/chat'
interface Props {
  messages: MessageItem[]
  loading: boolean
}
const props = defineProps<Props>()
const containerRef = ref<HTMLDivElement | null>(null)
watch(
  // 监听消息长度的变化，当消息长度变化时，滚动到最底部
  () => props.messages.length,
  async () => {
    // 确保 DOM 更新完成后执行滚动操作，先等 Vue 把新消息渲染到页面上，再去计算高度并滚动。
    await nextTick()
    // 如果容器存在，滚动到最底部
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  },
  // 组件初始化时先执行一次，首次进入页面也会滚到底部
  { immediate: true },
)
</script>
<template>
  <div ref="containerRef" class="message-list">
    <div v-if="props.messages.length === 0" class="message-list__empty">
      还没有消息，先发一句试试吧。
    </div>
    <div
      v-for="item in props.messages"
      :key="item.id"
      class="message-row"
      :class="{ 'is-user': item.role === 'user' }"
    >
      <div class="message-bubble" :class="{ 'is-user-bubble': item.role === 'user' }">
        <div class="message-role">{{ item.role === 'user' ? '你' : 'AI' }}</div>
        <div class="message-content">{{ item.content }}</div>
        <div class="message-time">{{ item.time }}</div>
      </div>
    </div>
    <div v-if="props.loading" class="message-row">
      <div class="message-bubble">
        <div class="message-role">AI</div>
        <div class="message-content">正在思考中...</div>
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
  color: #94a3b8;
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
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
}
.message-bubble.is-user-bubble {
  background: #dcfce7;
  border-color: #86efac;
}
.message-role {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
}
.message-content {
  color: #0f172a;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
.message-time {
  margin-top: 6px;
  font-size: 11px;
  color: #94a3b8;
}
</style>
