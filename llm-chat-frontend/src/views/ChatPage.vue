<script setup lang="ts">
import { storeToRefs } from 'pinia'
import ChatLayout from '@/components/chat/ChatLayout.vue'
import SessionList from '@/components/chat/SessionList.vue'
import ChatHeader from '@/components/chat/ChatHeader.vue'
import MessageList from '@/components/chat/MessageList.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
chatStore.init()
const { sessions, activeSessionId, activeTitle, currentMessages, loading } = storeToRefs(chatStore)
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
