<script setup lang="ts">
// storeToRefs的作用是：把 store 里的状态 / getter 取出来，并且保持响应式。
import { storeToRefs } from 'pinia'
import ChatLayout from '@/components/chat/ChatLayout.vue'
import SessionList from '@/components/chat/SessionList.vue'
import ChatHeader from '@/components/chat/ChatHeader.vue'
import MessageList from '@/components/chat/MessageList.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import SystemPromptPanel from '@/components/chat/SystemPromptPanel.vue'
import TemperaturePanel from '@/components/chat/TemperaturePanel.vue'
import ModelSelectPanel from '@/components/chat/ModelSelectPanel.vue'
import { useChatStore } from '@/stores/chat'

// 真正的使用这个Pinia store
const chatStore = useChatStore()
// 初始化 store
chatStore.init()
// 把 store 里的状态 / getter 取出来，并且保持响应式。
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

// 把 store 里的方法取出来，解构action
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
      <div class="chat-page__footer">
        <SystemPromptPanel
          :model-value="systemPrompt"
          :loading="loading"
          @update:model-value="updateSystemPrompt"
        />

        <TemperaturePanel
          :model-value="temperature"
          :loading="loading"
          @update:model-value="updateTemperature"
        />

        <ModelSelectPanel
          :model-value="model"
          :loading="loading"
          @update:model-value="updateModel"
        />

        <MessageInput
          :loading="loading"
          @send-message="sendMessage"
          @stop-generate="stopGenerating"
        />
      </div>
    </template>
  </ChatLayout>
</template>

<style scoped>
.chat-page__footer {
  display: flex;
  flex-direction: column;
}
</style>
