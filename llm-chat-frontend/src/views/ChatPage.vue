<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import ChatLayout from '@/components/chat/ChatLayout.vue'
import SessionList from '@/components/chat/SessionList.vue'
import ChatHeader from '@/components/chat/ChatHeader.vue'
import MessageList from '@/components/chat/MessageList.vue'
import ChatComposer from '@/components/chat/ChatComposer.vue'
import { useViewport } from '@/composables/useViewport'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
void chatStore.init()

const { isMobile } = useViewport()
const sidebarOpen = ref(false)

const {
  sessions,
  activeSessionId,
  activeTitle,
  currentMessages,
  loading,
  syncing,
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

const modelLabel = computed(() => {
  return model.value === 'deepseek-v4-pro' ? 'DeepSeek V4 Pro' : 'DeepSeek V4 Flash'
})

watch(
  isMobile,
  (mobile) => {
    sidebarOpen.value = !mobile
  },
  { immediate: true },
)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

function handleSelectSession(id: number) {
  selectSession(id)
  closeSidebar()
}

function handleCreateSession() {
  createSession()
  closeSidebar()
}
</script>

<template>
  <ChatLayout
    :is-mobile="isMobile"
    :sidebar-open="sidebarOpen"
    @update:sidebar-open="sidebarOpen = $event"
  >
    <template #sider>
      <SessionList
        :sessions="sessions"
        :active-session-id="activeSessionId"
        @select-session="handleSelectSession"
        @create-session="handleCreateSession"
        @rename-session="renameSession"
        @del-session="deleteSession"
      />
    </template>

    <template #header>
      <ChatHeader
        :title="activeTitle"
        :message-count="currentMessages.length"
        :loading="loading"
        :syncing="syncing"
        :model-label="modelLabel"
        :is-mobile="isMobile"
        @clear-session="clearCurrentSession"
        @toggle-sidebar="toggleSidebar"
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
