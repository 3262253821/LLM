import type { ChatPersistedState } from '@/types/chat'

// F12时在 localStorage 中查看缓存名字，发现是 llm-chat-frontend:chat-state
// 单独定义成常量CHAT_STORAGE_KEY，方便后续用到这个key，在读取、保存、清空时候都用这个key
// 不然每次都要手写
const CHAT_STORAGE_KEY = 'llm-chat-frontend:chat-state'
function getChatStorageKey(userId?: string) {
  return userId ? `${CHAT_STORAGE_KEY}:${userId}` : CHAT_STORAGE_KEY
}
// loadChatState() 从 localStorage 中读取聊天状态
// 写 | null 的原因是，如果 localStorage 中没有缓存或者缓存格式错误，返回 null
export function loadChatState(userId?: string): ChatPersistedState | null {
  const storageKey = getChatStorageKey(userId)
  const raw = localStorage.getItem(storageKey)
  if (!raw) return null
  // 尝试解析 JSON 字符串
  // as ChatPersistedState 是类型断言，确保解析后的对象是 ChatPersistedState 类型
  try {
    return JSON.parse(raw) as ChatPersistedState
  } catch (error) {
    // 如果解析失败，说明缓存格式错误，删除缓存并返回 null
    console.error('读取聊天缓存失败：', error)
    localStorage.removeItem(storageKey)
    // 返回的null可以被上层的init()函数处理，就会去创建默认的聊天状态
    return null
  }
}
// saveChatState() 把store中拿出来的数据存到本地
export function saveChatState(state: ChatPersistedState, userId?: string) {
  // 把 state 转换为 JSON 字符串在存储到 localStorage 中
  localStorage.setItem(getChatStorageKey(userId), JSON.stringify(state))
}
// clearChatState() 清空 localStorage 中的聊天状态
export function clearChatState(userId?: string) {
  localStorage.removeItem(getChatStorageKey(userId))
}
