export type MessageRole = 'user' | 'assistant'

// ChatModel 表示当前项目支持的模型名称
export type ChatModel = 'deepseek-v4-flash' | 'deepseek-v4-pro'

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
  // systemPrompt 表示当前全局的系统提示词配置
  systemPrompt: string
  // temperature 表示当前全局的模型随机性配置
  temperature: number
  // model 表示当前用户选中的模型
  model: ChatModel
}
