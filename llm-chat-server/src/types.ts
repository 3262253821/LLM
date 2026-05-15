export interface UserRecord {
  id: string
  account: string
  username: string
  passwordHash: string
  avatar?: string
  createdAt: string
}

export interface PersistedChatState {
  sessions: Array<{
    id: number
    title: string
  }>
  activeSessionId: number
  messagesBySession: Record<
    number,
    Array<{
      id: number
      role: 'user' | 'assistant'
      content: string
      time: string
    }>
  >
  systemPrompt: string
  temperature: number
  model: 'deepseek-v4-flash' | 'deepseek-v4-pro'
}
