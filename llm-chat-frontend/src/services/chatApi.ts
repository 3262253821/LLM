import type { ChatModel, MessageItem } from '@/types/chat'
import { useAuthStore } from '@/stores/auth'

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekStreamChoice {
  delta?: {
    content?: string | null
  }
}

interface DeepSeekStreamChunk {
  choices?: DeepSeekStreamChoice[]
  error?: {
    message?: string
  }
}

interface SendChatMessageStreamOptions {
  signal?: AbortSignal
  systemPrompt?: string
  temperature?: number
  model?: ChatModel
}

function normalizeTemperature(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 1
  }

  return Math.min(2, Math.max(0, value))
}

function resolveModel(model?: ChatModel) {
  return model || (import.meta.env.VITE_LLM_MODEL as ChatModel)
}

function toDeepSeekMessages(messages: MessageItem[], systemPrompt?: string): DeepSeekMessage[] {
  const chatMessages = messages.map((item) => ({
    role: item.role,
    content: item.content,
  }))

  const prompt = systemPrompt?.trim()

  if (!prompt) {
    return chatMessages
  }

  return [
    {
      role: 'system',
      content: prompt,
    },
    ...chatMessages,
  ]
}

export async function sendChatMessageStream(
  messages: MessageItem[],
  onChunk: (chunkText: string) => void,
  options: SendChatMessageStreamOptions = {},
): Promise<string> {
  const { signal, systemPrompt, temperature, model } = options

  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const defaultModel = import.meta.env.VITE_LLM_MODEL
  const authStore = useAuthStore()

  if (!baseUrl) {
    throw new Error('缺少 VITE_API_BASE_URL 配置')
  }

  if (!defaultModel) {
    throw new Error('缺少 VITE_LLM_MODEL 配置')
  }

  if (!authStore.token) {
    throw new Error('当前未登录，请先登录后再发送消息')
  }

  const response = await fetch(`${baseUrl}/api/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${authStore.token}`,
    },
    body: JSON.stringify({
      model: resolveModel(model),
      messages: toDeepSeekMessages(messages, systemPrompt),
      temperature: normalizeTemperature(temperature),
      stream: true,
    }),
    signal,
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as DeepSeekStreamChunk | null
    throw new Error(data?.error?.message || '请求聊天接口失败')
  }

  if (!response.body) {
    throw new Error('当前环境不支持流式读取')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let fullText = ''
  let buffer = ''

  const handleEvent = (eventText: string) => {
    const lines = eventText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    for (const line of lines) {
      if (!line.startsWith('data:')) continue

      const dataText = line.slice(5).trim()
      if (dataText === '[DONE]') continue

      const chunk = JSON.parse(dataText) as DeepSeekStreamChunk
      const chunkText = chunk.choices?.[0]?.delta?.content ?? ''

      if (!chunkText) continue

      fullText += chunkText
      onChunk(chunkText)
    }
  }

  const consumeBuffer = () => {
    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const event of events) {
      handleEvent(event)
    }
  }

  while (true) {
    const { value, done } = await reader.read()

    if (done) {
      buffer += decoder.decode()
      break
    }

    buffer += decoder.decode(value, { stream: true })
    consumeBuffer()
  }

  consumeBuffer()

  if (buffer.trim()) {
    handleEvent(buffer)
  }

  const replyText = fullText.trim()

  if (!replyText) {
    throw new Error('模型返回内容为空')
  }

  return replyText
}
