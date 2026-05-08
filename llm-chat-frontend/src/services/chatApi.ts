import type { MessageItem } from '@/types/chat'
interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}
interface DeepSeekChoice {
  message?: {
    content?: string
  }
}
interface DeepSeekResponse {
  choices?: DeepSeekChoice[]
  error?: {
    message?: string
  }
}
function toDeepSeekMessages(messages: MessageItem[]): DeepSeekMessage[] {
  return messages.map((item) => ({
    role: item.role,
    content: item.content,
  }))
}
export async function sendChatMessage(messages: MessageItem[]): Promise<string> {
  const baseUrl = import.meta.env.VITE_LLM_BASE_URL
  const apiKey = import.meta.env.VITE_LLM_API_KEY
  const model = import.meta.env.VITE_LLM_MODEL
  if (!baseUrl) {
    throw new Error('缺少 VITE_LLM_BASE_URL 配置')
  }
  if (!apiKey) {
    throw new Error('缺少 VITE_LLM_API_KEY 配置')
  }
  if (!model) {
    throw new Error('缺少 VITE_LLM_MODEL 配置')
  }
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: toDeepSeekMessages(messages),
      stream: false,
    }),
  })
  const data = (await response.json()) as DeepSeekResponse
  if (!response.ok) {
    throw new Error(data.error?.message || '请求 DeepSeek 接口失败')
  }
  const replyText = data.choices?.[0]?.message?.content?.trim()
  if (!replyText) {
    throw new Error('DeepSeek 返回内容为空')
  }
  return replyText
}
