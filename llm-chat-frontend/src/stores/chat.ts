import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { loadChatState, saveChatState } from '@/utils/chatStorage'
import type { ChatPersistedState, MessageItem, MessagesBySession, SessionItem } from '@/types/chat'

// 获取当前时间，格式为 HH:mm:ss（作用就是发消息和接收消息时，都记录下当前时间）
function getNow() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
// 这个函数的作用是当本地没有缓存时，创建一个默认的聊天状态
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
// 这个函数作用是：当所有会话被删光时，自动补一个空会话，避免页面没有可用状态。
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
// 用 Pinia 定义一个名字叫 chat 的 store，并导出一个 useChatStore 函数给页面调用。
export const useChatStore = defineStore('chat', () => {
  // state部分，都是响应式数据
  const sessions = ref<SessionItem[]>([]) // 会话列表，初始为空数组
  const activeSessionId = ref(0) // 当前选中的会话 ID，初始为 0
  const messagesBySession = ref<MessagesBySession>({}) // 每个会话的消息列表，初始为空对象
  const loading = ref(false) // 是否正在加载中，初始为 false
  const inited = ref(false) // 是否初始化完成，初始为 false
  // computed部分，计算属性
  // 当前选中的会话标题
  const activeTitle = computed(() => {
    // find函数，从数组中找到符合条件的第一个元素，找到就返回该元素，否则返回 undefined
    const target = sessions.value.find((item) => item.id === activeSessionId.value)
    // ?.可选链操作符，如果 target存在返回target.title，否则返回undefined
    // ?? 空合并操作符，如果 target 为 undefined，就返回 '未命名会话'
    return target?.title ?? '未命名会话'
  })
  // 当前选中的会话消息列表
  const currentMessages = computed(() => {
    return messagesBySession.value[activeSessionId.value] ?? []
  })
  // 把状态整体灌进 store，定义一个内部工具函数，专门负责“整包替换当前 store 状态”。
  // 把读出来的数据放进 store
  function applyState(state: ChatPersistedState) {
    sessions.value = state.sessions
    activeSessionId.value = state.activeSessionId
    messagesBySession.value = state.messagesBySession ?? {}
  }
  // 生成当前快照，定义一个函数，用来把当前 store 数据整理成一个可持久化对象。
  // 把 store 当前数据拿出来
  function getSnapshot(): ChatPersistedState {
    return {
      sessions: sessions.value,
      activeSessionId: activeSessionId.value,
      messagesBySession: messagesBySession.value,
    }
  }
  // 定义一个“持久化”函数。
  // 把 store 当前数据存到本地
  // 以后只要状态发生变化，就调用它，避免你到处手写 localStorage.setItem(...)。
  function persist() {
    saveChatState(getSnapshot())
  }

  //  ensureUsableState：兜底修正状态
  // 这个函数的作用 保证状态“始终可用”，避免出现：没会话、当前会话 id 无效、某个会话没有消息数组 这类问题。
  function ensureUsableState() {
    // 如果会话列表为空，就创建一个空会话
    if (sessions.value.length === 0) {
      applyState(createEmptySessionState())
      persist()
      return
    }
    // some函数意思是，只要数组里有一个元素符合条件，就返回 true，一个都没有返回 false
    const hasActiveSession = sessions.value.some((item) => item.id === activeSessionId.value)
    // 如果当前会话 id 无效，就切换到第一个会话
    if (!hasActiveSession) {
      const firstSessionId = sessions.value[0]?.id
      // 空数组时，sessions.value[0]不存在，拿不到id
      if (firstSessionId !== undefined) {
        activeSessionId.value = firstSessionId
      }
    }
    // for of 是遍历数组的每个元素，返回的是值
    // for in 是遍历数组的每个索引，返回的是索引
    for (const session of sessions.value) {
      // ??=，如果左边为null或undefined，就把右边赋值给左边
      messagesBySession.value[session.id] ??= []
    }
  }

  // 初始化store
  // 这个函数决定了页面第一次打开时，数据是“从缓存恢复”还是“走默认示例数据”。
  function init() {
    // 如果已经初始化完成，就直接返回
    if (inited.value) return
    // 从 localStorage 中读取聊天状态
    const savedState = loadChatState()
    // 如果有保存的状态
    if (savedState) {
      // 应用到 store
      applyState(savedState)
      // 修正状态
      ensureUsableState()
    } else {
      applyState(createDefaultState())
      persist()
    }
    // 标记为已初始化
    inited.value = true
  }
  // nextMessageId：生成下一条消息 id
  // 这个函数的作用是保证每个会话内部的消息 id 是递增的。
  function nextMessageId(sessionId: number) {
    const list = messagesBySession.value[sessionId] ?? []
    // 取这个消息数组的最后一条消息。
    // .at(-1) 就是“拿最后一个元素”。
    const last = list.at(-1)
    return last ? last.id + 1 : 1
  }
  // selectSession：切换会话
  // 这个函数的作用是切换当前选中的会话。
  function selectSession(id: number) {
    activeSessionId.value = id
    persist()
  }
  // createSession：创建会话
  // 这个函数的作用是创建一个新的会话。
  function createSession() {
    const id = Date.now()
    // unshift是把新会话插入数组的最前面
    sessions.value.unshift({
      id,
      title: '新会话',
    })
    messagesBySession.value[id] = []
    activeSessionId.value = id
    persist()
  }
  // renameSession：重命名会话
  // 这个函数的作用是重命名一个会话。
  function renameSession(id: number, title: string) {
    const target = sessions.value.find((item) => item.id === id)
    if (!target) return
    target.title = title.trim() || '未命名会话'
    persist()
  }
  // deleteSession：删除会话
  // 这个函数的作用是删除一个会话。
  function deleteSession(id: number) {
    // 判断删除的会话是否是当前选中的会话
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
