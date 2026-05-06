export type MessageRole = 'user' | 'assistant'
export interface SessionItem {
  id: number
  title: string
}
export interface MessageItem {
  id: number
  role: MessageRole
  content: string
  time: string
}
export type MessagesBySession = Record<number, MessageItem[]>
export interface ChatPersistedState {
  sessions: SessionItem[]
  activeSessionId: number
  messagesBySession: MessagesBySession
}
