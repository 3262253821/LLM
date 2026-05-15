<script setup lang="ts">
import { storeToRefs } from 'pinia'
import ChatLayout from '@/components/chat/ChatLayout.vue'
import SessionList from '@/components/chat/SessionList.vue'
import ChatHeader from '@/components/chat/ChatHeader.vue'
import MessageList from '@/components/chat/MessageList.vue'
import ChatComposer from '@/components/chat/ChatComposer.vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

chatStore.init()

const {
  sessions,
  activeSessionId,
  activeTitle,
  currentMessages,
  loading,
  systemPrompt,
  temperature,
  model,
} = storeToRefs(chatStore)

const {
  selectSession,
  createSession,
  renameSession,
  deleteSession,
  sendMessage,
  stopGenerating,
  regenerateMessage,
  clearCurrentSession,
  updateSystemPrompt,
  updateTemperature,
  updateModel,
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
      <MessageList
        :messages="currentMessages"
        :loading="loading"
        @regenerate-message="regenerateMessage"
      />
    </template>

    <template #footer>
      <ChatComposer
        :loading="loading"
        :system-prompt="systemPrompt"
        :temperature="temperature"
        :model="model"
        @send-message="sendMessage"
        @stop-generate="stopGenerating"
        @update:system-prompt="updateSystemPrompt"
        @update:temperature="updateTemperature"
        @update:model="updateModel"
      />
    </template>
  </ChatLayout>
</template>
