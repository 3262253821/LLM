import type { ChatPersistedState } from '@/types/chat'

const CHAT_STORAGE_KEY = 'llm-chat-frontend:chat-state'
export function loadChatState(): ChatPersistedState | null {
  const raw = localStorage.getItem(CHAT_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ChatPersistedState
  } catch (error) {
    console.error('读取聊天缓存失败：', error)
    localStorage.removeItem(CHAT_STORAGE_KEY)
    return null
  }
}
export function saveChatState(state: ChatPersistedState) {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state))
}
export function clearChatState() {
  localStorage.removeItem(CHAT_STORAGE_KEY)
}
