import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { sendChatMessageStream } from '@/services/chatApi'
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
  const abortController = ref<AbortController | null>(null) // 当前这一次流式请求对应的终止控制器
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

  // 判断当前错误是不是“主动中断请求”产生的 AbortError
  function isAbortError(error: unknown) {
    return error instanceof DOMException && error.name === 'AbortError'
  }

  // 统一处理“AI 回复失败”时的消息显示
  function handleReplyError(sessionId: number, error: unknown) {
    // 错误类型是否是Error,是则提取错误信息,否则使用默认错误信息
    const errorText =
      error instanceof Error ? `请求失败：${error.message}` : '请求失败：发生未知错误'

    const currentList = messagesBySession.value[sessionId] ?? []
    // 取出最后一条消息,即最新的AI消息
    const lastMessage = currentList.at(-1)
    // 只有当最后一条消息存在，并且它是 assistant，
    // 并且它的内容是“正在思考中...”或者空字符串，才直接把这条消息改成错误提示。
    if (
      lastMessage &&
      lastMessage.role === 'assistant' &&
      (lastMessage.content === '正在思考中...' || lastMessage.content === '')
    ) {
      lastMessage.content = errorText
    } else {
      const errorMessage: MessageItem = {
        id: nextMessageId(sessionId),
        role: 'assistant',
        content: errorText,
        time: getNow(),
      }

      messagesBySession.value[sessionId] = [...currentList, errorMessage]
    }
  }

  // 统一处理“停止生成”时的消息显示
  function handleReplyAbort(sessionId: number) {
    const currentList = messagesBySession.value[sessionId] ?? []
    // 取出最后一条消息,即最新的AI消息
    const lastMessage = currentList.at(-1)

    // 如果一条真实内容都还没返回，就把“正在思考中...”改成“已停止生成”
    if (
      lastMessage &&
      lastMessage.role === 'assistant' &&
      lastMessage.content === '正在思考中...'
    ) {
      lastMessage.content = '已停止生成'
    }
    // 如果已经有部分流式内容了，这里什么都不做，保留已生成的内容
  }

  // 把“请求 AI 流式回复”这段逻辑单独提取出来，sendMessage 和 regenerateMessage 都复用它
  async function streamAssistantReply(sessionId: number, sessionMessages: MessageItem[]) {
    // 手动创建一条'AI占位消息',整个过程中变化的只有content字段
    const assistantMessage: MessageItem = {
      id: nextMessageId(sessionId),
      role: 'assistant',
      content: '正在思考中...',
      time: getNow(),
    }

    messagesBySession.value[sessionId] = [...sessionMessages, assistantMessage]
    // 把刚刚插进去的那条AI消息的位置记录下来
    const assistantIndex = messagesBySession.value[sessionId].length - 1

    // 为这一次请求单独创建一个 AbortController
    const controller = new AbortController()
    abortController.value = controller

    try {
      // 流式输出的核心逻辑:
      // 调用流式请求函数，把当前会话消息发给 DeepSeek，并且传进去一个回调函数。回调函数参数:chunkText
      await sendChatMessageStream(
        sessionMessages,
        (chunkText) => {
          // 拿到最新的消息数组
          const currentList = messagesBySession.value[sessionId]
          if (!currentList) return
          // 根据刚才保存的 assistantIndex，把那条“正在思考中...”的 AI 消息取出来。
          const currentAssistantMessage = currentList[assistantIndex]
          if (!currentAssistantMessage) return

          if (currentAssistantMessage.content === '正在思考中...') {
            currentAssistantMessage.content = chunkText
          } else {
            currentAssistantMessage.content += chunkText
          }
        },
        controller.signal,
      )
    } catch (error) {
      // 如果这是用户主动点击“停止生成”触发的中断，就按中断逻辑处理，不按普通错误处理
      if (isAbortError(error)) {
        handleReplyAbort(sessionId)
        return
      }

      handleReplyError(sessionId, error)
    } finally {
      // 只清空当前这一次请求对应的 controller，避免误伤别的请求状态
      if (abortController.value === controller) {
        abortController.value = null
      }
    }
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
    // filter函数是返回一个新的数组，只包含符合条件的元素
    sessions.value = sessions.value.filter((item) => item.id !== id)
    // 同时删掉对应的消息数组
    delete messagesBySession.value[id]
    // 如果删的不是当前选中的会话，也要继续处理。因为虽然没删除当前会话，但还是删掉了两块状态
    // 所以说状态发生了变化，就要修正状态并且更新状态到本地
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
  // sendMessage：发送消息
  // 这个函数的作用是发送一条消息。
  // 异步函数，因为要等待服务器返回结果。
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
    if (currentSession && currentSession.title === '新会话') {
      currentSession.title = value.slice(0, 12) || '新会话'
    }

    loading.value = true
    persist()

    try {
      const sessionMessages = messagesBySession.value[sessionId] ?? []
      await streamAssistantReply(sessionId, sessionMessages)
    } finally {
      loading.value = false
      persist()
    }
  }

  // stopGenerating：停止生成
  // 这个函数的作用是主动中断当前这一次流式请求。
  function stopGenerating() {
    if (!loading.value) return
    // abort是真正执行停止命令的方法
    abortController.value?.abort()
  }

  // regenerateMessage：重新回答
  // 这个函数的作用是：删除当前这条 AI 回复，然后基于它前面的上下文重新请求一次。
  async function regenerateMessage(messageId: number) {
    if (loading.value) return

    const sessionId = activeSessionId.value
    const currentList = messagesBySession.value[sessionId] ?? []

    // 找到要重新回答的那条 assistant 消息位置
    // 不用find而是用findIndex，因为findIndex返回的是索引，而find返回的是元素
    // 这里需要的知识是：位置，而不是元素
    const targetIndex = currentList.findIndex((item) => item.id === messageId)
    if (targetIndex === -1) return

    const targetMessage = currentList[targetIndex]
    const previousMessage = currentList[targetIndex - 1]

    // 只有当目标消息存在、它是 assistant、并且它前面一条是 user 时，才允许重新回答
    if (!targetMessage || targetMessage.role !== 'assistant' || previousMessage?.role !== 'user') {
      return
    }

    // 截取到目标 assistant 消息之前，把旧回答先删掉
    const requestMessages = currentList.slice(0, targetIndex)
    messagesBySession.value[sessionId] = requestMessages

    loading.value = true
    persist()

    try {
      await streamAssistantReply(sessionId, requestMessages)
    } finally {
      loading.value = false
      persist()
    }
  }

  // clearCurrentSession：清空当前会话
  // 这个函数的作用是清空当前选中的会话的所有消息。
  function clearCurrentSession() {
    messagesBySession.value[activeSessionId.value] = []
    persist()
  }
  // return：暴露给页面使用
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
    stopGenerating,
    regenerateMessage,
    clearCurrentSession,
  }
})
