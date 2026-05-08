import type { ChatPersistedState } from '@/types/chat'

// F12时在 localStorage 中查看缓存名字，发现是 llm-chat-frontend:chat-state
// 单独定义成常量CHAT_STORAGE_KEY，方便后续用到这个key，在读取、保存、清空时候都用这个key
// 不然每次都要手写
const CHAT_STORAGE_KEY = 'llm-chat-frontend:chat-state'
// loadChatState() 从 localStorage 中读取聊天状态
// 写 | null 的原因是，如果 localStorage 中没有缓存或者缓存格式错误，返回 null
export function loadChatState(): ChatPersistedState | null {
  const raw = localStorage.getItem(CHAT_STORAGE_KEY)
  if (!raw) return null
  // 尝试解析 JSON 字符串
  // as ChatPersistedState 是类型断言，确保解析后的对象是 ChatPersistedState 类型
  try {
    return JSON.parse(raw) as ChatPersistedState
  } catch (error) {
    // 如果解析失败，说明缓存格式错误，删除缓存并返回 null
    console.error('读取聊天缓存失败：', error)
    localStorage.removeItem(CHAT_STORAGE_KEY)
    // 返回的null可以被上层的init()函数处理，就会去创建默认的聊天状态
    return null
  }
}
// saveChatState() 把store中拿出来的数据存到本地
export function saveChatState(state: ChatPersistedState) {
  // 把 state 转换为 JSON 字符串在存储到 localStorage 中
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state))
}
// clearChatState() 清空 localStorage 中的聊天状态
export function clearChatState() {
  localStorage.removeItem(CHAT_STORAGE_KEY)
}
