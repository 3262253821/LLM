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
// 监听消息列表变化，并在页面更新完成后，自动把聊天区域滚动到底部。
watch(
  // 监听的三个东西，分别是：
  // 1. 消息列表的长度
  // 2. 最后一条消息的内容
  // 3. 加载状态
  () => [props.messages.length, props.messages.at(-1)?.content, props.loading],
  async () => {
    // 先等 Vue 把 DOM 更新完，再去执行滚动。
    await nextTick()
    // 先判断聊天容器的dom是否存在
    if (containerRef.value) {
      // scrollTop：当前滚动条滚动到的位置
      // scrollHeight：整个可滚动内容的总高度
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  },
  // 在 watch 刚创建时，先立即执行一次回调。
  // 因为这样页面第一次进入时，即使还没发生数据变化，也会先自动滚动到底部一次。
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
