import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { loadChatState, saveChatState } from '@/utils/chatStorage'
import type { ChatPersistedState, MessageItem, MessagesBySession, SessionItem } from '@/types/chat'

// 获取当前时间，格式为 HH:mm:ss
function getNow() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
function createDefaultState(): ChatPersistedState {
  const time = getNow()
  return {
    sessions: [
      { id: 1, title: '默认会话' },
      { id: 2, title: 'Vue 组件通信' },
    ],
    activeSessionId: 1,
    messagesBySession: {
      1: [
        {
          id: 1,
          role: 'assistant',
          content: '你好，我是天才程序员(gpt大人)^_^。',
          time,
        },
      ],
      2: [
        {
          id: 1,
          role: 'user',
          content: '我是你爹。',
          time,
        },
      ],
    },
  }
}
function createEmptySessionState(): ChatPersistedState {
  const id = Date.now()
  return {
    sessions: [{ id, title: '新会话' }],
    activeSessionId: id,
    messagesBySession: {
      [id]: [],
    },
  }
}
export const useChatStore = defineStore('chat', () => {
  const sessions = ref<SessionItem[]>([])
  const activeSessionId = ref(0)
  const messagesBySession = ref<MessagesBySession>({})
  const loading = ref(false)
  const inited = ref(false)
  const activeTitle = computed(() => {
    const target = sessions.value.find((item) => item.id === activeSessionId.value)
    return target?.title ?? '未命名会话'
  })
  const currentMessages = computed(() => {
    return messagesBySession.value[activeSessionId.value] ?? []
  })
  function applyState(state: ChatPersistedState) {
    sessions.value = state.sessions
    activeSessionId.value = state.activeSessionId
    messagesBySession.value = state.messagesBySession ?? {}
  }
  function getSnapshot(): ChatPersistedState {
    return {
      sessions: sessions.value,
      activeSessionId: activeSessionId.value,
      messagesBySession: messagesBySession.value,
    }
  }
  function persist() {
    saveChatState(getSnapshot())
  }
  function ensureUsableState() {
    if (sessions.value.length === 0) {
      applyState(createEmptySessionState())
      persist()
      return
    }
    const hasActiveSession = sessions.value.some((item) => item.id === activeSessionId.value)
    if (!hasActiveSession) {
      const firstSessionId = sessions.value[0]?.id
      if (firstSessionId !== undefined) {
        activeSessionId.value = firstSessionId
      }
    }
    for (const session of sessions.value) {
      messagesBySession.value[session.id] ??= []
    }
  }
  function init() {
    if (inited.value) return
    const savedState = loadChatState()
    if (savedState) {
      applyState(savedState)
      ensureUsableState()
    } else {
      applyState(createDefaultState())
      persist()
    }
    inited.value = true
  }
  function nextMessageId(sessionId: number) {
    const list = messagesBySession.value[sessionId] ?? []
    const last = list.at(-1)
    return last ? last.id + 1 : 1
  }
  function selectSession(id: number) {
    activeSessionId.value = id
    persist()
  }
  function createSession() {
    const id = Date.now()
    sessions.value.unshift({
      id,
      title: '新会话',
    })
    messagesBySession.value[id] = []
    activeSessionId.value = id
    persist()
  }
  function renameSession(id: number, title: string) {
    const target = sessions.value.find((item) => item.id === id)
    if (!target) return
    target.title = title.trim() || '未命名会话'
    persist()
  }
  function deleteSession(id: number) {
    const isActive = activeSessionId.value === id
    sessions.value = sessions.value.filter((item) => item.id !== id)
    delete messagesBySession.value[id]
    if (!isActive) {
      ensureUsableState()
      persist()
      return
    }
    if (sessions.value.length > 0) {
      const firstSessionId = sessions.value[0]?.id
      if (firstSessionId !== undefined) {
        activeSessionId.value = firstSessionId
      }
      ensureUsableState()
      persist()
      return
    }
    applyState(createEmptySessionState())
    persist()
  }
  function sendMessage(text: string) {
    const value = text.trim()
    if (!value || loading.value) return
    const sessionId = activeSessionId.value
    const userMessage: MessageItem = {
      id: nextMessageId(sessionId),
      role: 'user',
      content: value,
      time: getNow(),
    }
    messagesBySession.value[sessionId] = [
      ...(messagesBySession.value[sessionId] ?? []),
      userMessage,
    ]
    const currentSession = sessions.value.find((item) => item.id === sessionId)
    if (currentSession && currentSession.title === '新会话') {
      currentSession.title = value.slice(0, 12) || '新会话'
    }
    loading.value = true
    persist()
    window.setTimeout(() => {
      const assistantMessage: MessageItem = {
        id: nextMessageId(sessionId),
        role: 'assistant',
        content: `我收到了你的消息：“${value}”。下一步我们可以接真实 API。`,
        time: getNow(),
      }
      messagesBySession.value[sessionId] = [
        ...(messagesBySession.value[sessionId] ?? []),
        assistantMessage,
      ]
      loading.value = false
      persist()
    }, 700)
  }
  function clearCurrentSession() {
    messagesBySession.value[activeSessionId.value] = []
    persist()
  }
  return {
    sessions,
    activeSessionId,
    loading,
    activeTitle,
    currentMessages,
    init,
    selectSession,
    createSession,
    renameSession,
    deleteSession,
    sendMessage,
    clearCurrentSession,
  }
})
