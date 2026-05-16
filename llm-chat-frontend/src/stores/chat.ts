import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { sendChatMessageStream } from '@/services/chatApi'
import { fetchChatState, saveRemoteChatState } from '@/services/chatStateApi'
import { loadChatState, saveChatState } from '@/utils/chatStorage'
import { debounce } from '@/utils/performance'
import type {
  ChatModel,
  ChatPersistedState,
  MessageItem,
  MessagesBySession,
  SessionItem,
} from '@/types/chat'

const DEFAULT_SESSION_TITLE = '新对话'
const UNTITLED_SESSION_TITLE = '未命名会话'
const ASSISTANT_THINKING_TEXT = '正在思考中...'
const ASSISTANT_STOPPED_TEXT = '已停止生成'
const GUEST_SCOPE_KEY = '__guest__'

function getNow() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function isChatModel(value: string): value is ChatModel {
  return value === 'deepseek-v4-flash' || value === 'deepseek-v4-pro'
}

function getDefaultModel(): ChatModel {
  const envModel = import.meta.env.VITE_LLM_MODEL
  return isChatModel(envModel) ? envModel : 'deepseek-v4-flash'
}

function createEmptySessionState(
  systemPrompt = '',
  temperature = 1,
  model: ChatModel = getDefaultModel(),
): ChatPersistedState {
  const id = Date.now()

  return {
    sessions: [{ id, title: DEFAULT_SESSION_TITLE }],
    activeSessionId: id,
    messagesBySession: {
      [id]: [],
    },
    systemPrompt,
    temperature,
    model,
  }
}

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()
  const sessions = ref<SessionItem[]>([])
  const activeSessionId = ref(0)
  const messagesBySession = ref<MessagesBySession>({})
  const loading = ref(false)
  const inited = ref(false)
  const syncing = ref(false)
  const abortController = ref<AbortController | null>(null)
  const systemPrompt = ref('')
  const temperature = ref(1)
  const model = ref<ChatModel>(getDefaultModel())
  const currentScopeKey = ref('')
  let syncRequestId = 0
  let beforeUnloadBound = false

  const activeTitle = computed(() => {
    const target = sessions.value.find((item) => item.id === activeSessionId.value)
    return target?.title ?? UNTITLED_SESSION_TITLE
  })

  const currentMessages = computed(() => {
    return messagesBySession.value[activeSessionId.value] ?? []
  })

  function getScopeKey() {
    return authStore.isLoggedIn && authStore.user?.id ? authStore.user.id : GUEST_SCOPE_KEY
  }

  function applyState(state: ChatPersistedState) {
    sessions.value = state.sessions
    activeSessionId.value = state.activeSessionId
    messagesBySession.value = state.messagesBySession ?? {}
    systemPrompt.value = state.systemPrompt ?? ''
    temperature.value = typeof state.temperature === 'number' ? state.temperature : 1
    model.value = isChatModel(state.model) ? state.model : getDefaultModel()
  }

  function getSnapshot(): ChatPersistedState {
    return {
      sessions: sessions.value,
      activeSessionId: activeSessionId.value,
      messagesBySession: messagesBySession.value,
      systemPrompt: systemPrompt.value,
      temperature: temperature.value,
      model: model.value,
    }
  }

  function saveLocalSnapshot(snapshot = getSnapshot()) {
    saveChatState(snapshot, authStore.user?.id)
  }

  async function syncRemoteSnapshot(snapshot = getSnapshot()) {
    const userId = authStore.user?.id

    if (!authStore.isLoggedIn || !userId) return

    const requestId = ++syncRequestId
    syncing.value = true

    try {
      await saveRemoteChatState(snapshot)
    } finally {
      if (requestId === syncRequestId) {
        syncing.value = false
      }
    }
  }

  const scheduleLocalPersist = debounce(() => {
    saveLocalSnapshot()
  }, 120)

  const scheduleRemotePersist = debounce(() => {
    void syncRemoteSnapshot()
  }, 680)

  function cancelPendingPersistence() {
    scheduleLocalPersist.cancel()
    scheduleRemotePersist.cancel()
    syncRequestId += 1
    syncing.value = false
  }

  function persistLocal(options: { immediate?: boolean } = {}) {
    if (options.immediate) {
      scheduleLocalPersist.cancel()
      saveLocalSnapshot()
      return
    }

    scheduleLocalPersist()
  }

  function persist(options: { immediate?: boolean } = {}) {
    persistLocal(options)

    if (!authStore.isLoggedIn || !authStore.user?.id) return

    if (options.immediate) {
      scheduleRemotePersist.cancel()
      void syncRemoteSnapshot()
      return
    }

    scheduleRemotePersist()
  }

  function updateSystemPrompt(value: string) {
    systemPrompt.value = value
    persist()
  }

  function updateTemperature(value: number) {
    temperature.value = value
    persist()
  }

  function updateModel(value: ChatModel) {
    model.value = value
    persist()
  }

  function resetRuntimeState() {
    abortController.value?.abort()
    abortController.value = null
    loading.value = false
  }

  function ensureUsableState() {
    if (sessions.value.length === 0) {
      applyState(createEmptySessionState(systemPrompt.value, temperature.value, model.value))
      persist({ immediate: true })
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

  async function init(force = false) {
    const scopeKey = getScopeKey()

    if (inited.value && !force && currentScopeKey.value === scopeKey) {
      return
    }

    if (!beforeUnloadBound) {
      window.addEventListener('beforeunload', () => {
        scheduleLocalPersist.flush()
      })
      beforeUnloadBound = true
    }

    cancelPendingPersistence()
    resetRuntimeState()

    const savedState = loadChatState(authStore.user?.id)

    if (authStore.isLoggedIn && authStore.user?.id) {
      try {
        const remoteState = await fetchChatState()

        if (remoteState) {
          applyState(remoteState)
          ensureUsableState()
          persistLocal({ immediate: true })
        } else if (savedState) {
          applyState(savedState)
          ensureUsableState()
          persist({ immediate: true })
        } else {
          applyState(createEmptySessionState())
          persist({ immediate: true })
        }
      } catch {
        if (savedState) {
          applyState(savedState)
          ensureUsableState()
          persistLocal({ immediate: true })
        } else {
          applyState(createEmptySessionState())
          persist({ immediate: true })
        }
      }
    } else if (savedState) {
      applyState(savedState)
      ensureUsableState()
      persistLocal({ immediate: true })
    } else {
      applyState(createEmptySessionState())
      persistLocal({ immediate: true })
    }

    currentScopeKey.value = scopeKey
    inited.value = true
  }

  function nextMessageId(sessionId: number) {
    const list = messagesBySession.value[sessionId] ?? []
    const last = list.at(-1)
    return last ? last.id + 1 : 1
  }

  function isAbortError(error: unknown) {
    return error instanceof DOMException && error.name === 'AbortError'
  }

  function handleReplyError(sessionId: number, error: unknown) {
    const errorText =
      error instanceof Error ? `请求失败：${error.message}` : '请求失败：发生未知错误'

    const currentList = messagesBySession.value[sessionId] ?? []
    const lastMessage = currentList.at(-1)

    if (
      lastMessage &&
      lastMessage.role === 'assistant' &&
      (lastMessage.content === ASSISTANT_THINKING_TEXT || lastMessage.content === '')
    ) {
      lastMessage.content = errorText
      return
    }

    const errorMessage: MessageItem = {
      id: nextMessageId(sessionId),
      role: 'assistant',
      content: errorText,
      time: getNow(),
    }

    messagesBySession.value[sessionId] = [...currentList, errorMessage]
  }

  function handleReplyAbort(sessionId: number) {
    const currentList = messagesBySession.value[sessionId] ?? []
    const lastMessage = currentList.at(-1)

    if (
      lastMessage &&
      lastMessage.role === 'assistant' &&
      lastMessage.content === ASSISTANT_THINKING_TEXT
    ) {
      lastMessage.content = ASSISTANT_STOPPED_TEXT
    }
  }

  async function streamAssistantReply(
    sessionId: number,
    sessionMessages: MessageItem[],
    prompt: string,
    temperatureValue: number,
    currentModel: ChatModel,
  ) {
    const assistantMessage: MessageItem = {
      id: nextMessageId(sessionId),
      role: 'assistant',
      content: ASSISTANT_THINKING_TEXT,
      time: getNow(),
    }

    messagesBySession.value[sessionId] = [...sessionMessages, assistantMessage]
    const assistantIndex = messagesBySession.value[sessionId].length - 1

    const controller = new AbortController()
    abortController.value = controller

    try {
      await sendChatMessageStream(
        sessionMessages,
        (chunkText) => {
          const currentList = messagesBySession.value[sessionId]
          if (!currentList) return

          const currentAssistantMessage = currentList[assistantIndex]
          if (!currentAssistantMessage) return

          if (currentAssistantMessage.content === ASSISTANT_THINKING_TEXT) {
            currentAssistantMessage.content = chunkText
          } else {
            currentAssistantMessage.content += chunkText
          }
        },
        {
          signal: controller.signal,
          systemPrompt: prompt,
          temperature: temperatureValue,
          model: currentModel,
        },
      )
    } catch (error) {
      if (isAbortError(error)) {
        handleReplyAbort(sessionId)
        return
      }

      handleReplyError(sessionId, error)
    } finally {
      if (abortController.value === controller) {
        abortController.value = null
      }
    }
  }

  function selectSession(id: number) {
    activeSessionId.value = id
    persist()
  }

  function createSession() {
    const id = Date.now()

    sessions.value.unshift({
      id,
      title: DEFAULT_SESSION_TITLE,
    })

    messagesBySession.value[id] = []
    activeSessionId.value = id
    persist({ immediate: true })
  }

  function renameSession(id: number, title: string) {
    const target = sessions.value.find((item) => item.id === id)
    if (!target) return

    target.title = title.trim() || UNTITLED_SESSION_TITLE
    persist()
  }

  function deleteSession(id: number) {
    const isActive = activeSessionId.value === id

    sessions.value = sessions.value.filter((item) => item.id !== id)
    delete messagesBySession.value[id]

    if (!isActive) {
      ensureUsableState()
      persist({ immediate: true })
      return
    }

    if (sessions.value.length > 0) {
      const firstSessionId = sessions.value[0]?.id

      if (firstSessionId !== undefined) {
        activeSessionId.value = firstSessionId
      }

      ensureUsableState()
      persist({ immediate: true })
      return
    }

    applyState(createEmptySessionState(systemPrompt.value, temperature.value, model.value))
    persist({ immediate: true })
  }

  async function sendMessage(text: string) {
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

    if (currentSession && currentSession.title === DEFAULT_SESSION_TITLE) {
      currentSession.title = value.slice(0, 12) || DEFAULT_SESSION_TITLE
    }

    loading.value = true
    persist({ immediate: true })

    try {
      const sessionMessages = messagesBySession.value[sessionId] ?? []

      await streamAssistantReply(
        sessionId,
        sessionMessages,
        systemPrompt.value,
        temperature.value,
        model.value,
      )
    } finally {
      loading.value = false
      persist({ immediate: true })
    }
  }

  function stopGenerating() {
    if (!loading.value) return
    abortController.value?.abort()
  }

  async function regenerateMessage(messageId: number) {
    if (loading.value) return

    const sessionId = activeSessionId.value
    const currentList = messagesBySession.value[sessionId] ?? []
    const targetIndex = currentList.findIndex((item) => item.id === messageId)

    if (targetIndex === -1) return

    const targetMessage = currentList[targetIndex]
    const previousMessage = currentList[targetIndex - 1]

    if (!targetMessage || targetMessage.role !== 'assistant' || previousMessage?.role !== 'user') {
      return
    }

    const requestMessages = currentList.slice(0, targetIndex)
    messagesBySession.value[sessionId] = requestMessages

    loading.value = true
    persist({ immediate: true })

    try {
      await streamAssistantReply(
        sessionId,
        requestMessages,
        systemPrompt.value,
        temperature.value,
        model.value,
      )
    } finally {
      loading.value = false
      persist({ immediate: true })
    }
  }

  function clearCurrentSession() {
    messagesBySession.value[activeSessionId.value] = []
    persist({ immediate: true })
  }

  watch(
    () => getScopeKey(),
    (nextScopeKey, previousScopeKey) => {
      if (!inited.value || nextScopeKey === previousScopeKey) return
      void init(true)
    },
  )

  return {
    sessions,
    activeSessionId,
    loading,
    syncing,
    systemPrompt,
    temperature,
    model,
    activeTitle,
    currentMessages,
    init,
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
  }
})
