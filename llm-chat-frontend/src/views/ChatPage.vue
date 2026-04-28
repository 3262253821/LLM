<script setup lang="ts">
import { computed, ref } from 'vue'
import ChatLayout from '@/components/chat/ChatLayout.vue'
import SessionList from '@/components/chat/SessionList.vue'
import ChatHeader from '@/components/chat/ChatHeader.vue'
import MessageList from '@/components/chat/MessageList.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import type { MessageItem, SessionItem } from '@/types/chat'

// SessionItem[]是会话对象数组，数组每一项都要符合SessionItem
const sessions = ref<SessionItem[]>([
  { id: 1, title: '默认会话' },
  { id: 2, title: 'Vue 组件通信' },
])
// activeSessionId 是当前选中的会话 ID
const activeSessionId = ref<number>(1)

// ？？？
const messagesBySession = ref<Record<number, MessageItem[]>>({
  1: [{ id: 1, role: 'assistant', content: '你好，我是天才程序员(gpt大人)^_^。', time: getNow() }],
  2: [{ id: 1, role: 'user', content: '我是你爹。', time: getNow() }],
})
// loading 是发送消息时的是否是加载状态
const loading = ref(false)

// activeTitle 是当前选中的会话标题
const activeTitle = computed(() => {
  // 从 sessions 中查找 activeSessionId 对应的会话
  const target = sessions.value.find((s) => s.id === activeSessionId.value)
  // 如果找到会话，返回会话标题；否则返回 '未命名会话'
  return target?.title ?? '未命名会话'
})
// currentMessages 是当前选中的会话消息列表
const currentMessages = computed(() => {
  return messagesBySession.value[activeSessionId.value] ?? []
})
// 获取当前时间，格式为 HH:mm:ss
function getNow() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
// nextMessageId 是下一个消息 ID
function nextMessageId(sessionId: number) {
  const list = messagesBySession.value[sessionId] ?? []
  // 取数组最后一项，如果这个会话已经有消息，last就是最后一条消息，否则last就是 undefined
  const last = list.at(-1) // 可能是 MessageItem | undefined
  // 如果最后一条消息存在，新消息id=last.id+1；否则新消息id=1
  return last ? last.id + 1 : 1
}
// 切换会话 id是从子组件SessionList里面emit过来的
function selectSession(id: number) {
  activeSessionId.value = id
}
// 新建会话
function createSession() {
  const id = Date.now()
  // unshift 方法在数组开头添加一个或多个元素，并返回新的数组长度
  sessions.value.unshift({ id, title: '新会话' })
  messagesBySession.value[id] = []
  // 切换到新会话
  activeSessionId.value = id
}
// 发送消息
function sendMessage(text: string) {
  if (loading.value) return
  // sid指当前选中的会话ID
  const sid = activeSessionId.value
  // 构造一条用户消息对象
  const userMsg: MessageItem = {
    id: nextMessageId(sid),
    role: 'user',
    content: text,
    time: getNow(),
  }
  // 把用户消息添加到当前会话的消息列表中，再把新的userMsg放到最后面
  messagesBySession.value[sid] = [...(messagesBySession.value[sid] ?? []), userMsg]
  const currentSession = sessions.value.find((s) => s.id === sid)
  if (currentSession && currentSession.title === '新会话') {
    // 截取用户消息的前12个字符，作为会话标题，如果用户消息为空，就用默认标题 '新会话' 代替
    currentSession.title = text.slice(0, 12) || '新会话'
  }
  loading.value = true
  setTimeout(() => {
    const aiMsg: MessageItem = {
      id: nextMessageId(sid),
      role: 'assistant',
      content: `我收到了你的消息：“${text}”。下一步我们可以接真实 API。`,
      time: getNow(),
    }
    messagesBySession.value[sid] = [...(messagesBySession.value[sid] ?? []), aiMsg]
    loading.value = false
  }, 700)
}
// 清空会话
function clearSession() {
  messagesBySession.value[activeSessionId.value] = []
}
</script>
<template>
  <ChatLayout>
    <template #sider>
      <SessionList
        :sessions="sessions"
        :active-session-id="activeSessionId"
        @select-session="selectSession"
        @create-session="createSession"
      />
    </template>
    <template #header>
      <ChatHeader
        :title="activeTitle"
        :message-count="currentMessages.length"
        :loading="loading"
        @clear-session="clearSession"
      />
    </template>
    <template #content>
      <MessageList :messages="currentMessages" :loading="loading" />
    </template>
    <template #footer>
      <MessageInput @send-message="sendMessage" />
    </template>
  </ChatLayout>
</template>
