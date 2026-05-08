<script setup lang="ts">
// storeToRefs的作用是：把 store 里的状态 / getter 取出来，并且保持响应式。
import { storeToRefs } from 'pinia'
import ChatLayout from '@/components/chat/ChatLayout.vue'
import SessionList from '@/components/chat/SessionList.vue'
import ChatHeader from '@/components/chat/ChatHeader.vue'
import MessageList from '@/components/chat/MessageList.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import { useChatStore } from '@/stores/chat'

// 真正的使用这个Pinia store
const chatStore = useChatStore()
// 初始化 store
chatStore.init()
// 把 store 里的状态 / getter 取出来，并且保持响应式。
const { sessions, activeSessionId, activeTitle, currentMessages, loading } = storeToRefs(chatStore)
// 把 store 里的方法取出来，解构action
const {
  selectSession,
  createSession,
  renameSession,
  deleteSession,
  sendMessage,
  clearCurrentSession,
} = chatStore
</script>

<template>
  <ChatLayout>
    <template #sider>
      <SessionList
        :sessions="sessions"
        :active-session-id="activeSessionId"
        @select-session="selectSession"
        @create-session="createSession"
        @rename-session="renameSession"
        @del-session="deleteSession"
      />
    </template>
    <template #header>
      <ChatHeader
        :title="activeTitle"
        :message-count="currentMessages.length"
        :loading="loading"
        @clear-session="clearCurrentSession"
      />
    </template>
    <template #content>
      <MessageList :messages="currentMessages" :loading="loading" />
    </template>
    <template #footer>
      <MessageInput :loading="loading" @send-message="sendMessage" />
    </template>
  </ChatLayout>
</template>
