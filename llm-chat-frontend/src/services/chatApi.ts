// import type明确表示只导入类型，不导入实现。
import type { MessageItem } from '@/types/chat'

// 定义 DeepSeekMessage 接口，用于表示"发给deepseek的消息应该符合的格式"
interface DeepSeekMessage {
  // 角色，可以是 system、user 或 assistant
  role: 'system' | 'user' | 'assistant'
  content: string
}
// 定义 DeepSeekChoice 接口，用于表示"deepseek 返回的每个选择"
// “choices 数组里的每一项，可能有一个 message 对象；这个 message 对象里，可能有一个 content 字符串。”
interface DeepSeekChoice {
  message?: {
    content?: string
  }
}
// 定义 DeepSeekResponse 接口，用于表示"deepseek 返回的响应"
interface DeepSeekResponse {
  // 返回里可能有一个choices数组,数组里面每一项都符合DeepSeekChoice这个结构
  choices?: DeepSeekChoice[]
  // 如果请求失败,返回可能有一个error对象,这个对象里可能有错误信息message
  error?: {
    message?: string
  }
}
// 定义 toDeepSeekMessages 函数，接收参数messages,他是一个数组,数组每一项都是一个MessageItem对象
// DeepSeekMessage[]  表示这个函数返回的结果，是一个 DeepSeekMessage 数组。
// 该函数意思就是  “我写一个转换函数，把你项目里的消息格式，转成 DeepSeek 接口需要的消息格式。”
function toDeepSeekMessages(messages: MessageItem[]): DeepSeekMessage[] {
  // map方法,遍历数组每一项,返回新的数组
  // 例如下面例子中,返回messages中的role和content属性
  // 原来的messages可能长这样,{
  //   id: 1,
  //   role: 'user',
  //   content: '你好',
  //   time: '10:00:00'
  // }
  // 但是deepseek接口可能只需要role和content属性,所以需要转换一下
  return messages.map((item) => ({
    role: item.role,
    content: item.content,
  }))
}
// sendChatMessage函数意思是  “我定义一个可导出的异步函数，传入聊天消息数组，最后返回 AI 回复文本。”
export async function sendChatMessage(messages: MessageItem[]): Promise<string> {
  // 从环境变量中获取deepseek的的基础地址、API密钥、模型名称
  // 这是 Vite 前端项目里读取环境变量的固定写法。
  const baseUrl = import.meta.env.VITE_LLM_BASE_URL
  const apiKey = import.meta.env.VITE_LLM_API_KEY
  const model = import.meta.env.VITE_LLM_MODEL
  // 下面三个if是检查环境变量是否配置完整
  // 如果是空的、没有配置的、或者读不到就抛出错误,中断后面请求流程
  if (!baseUrl) {
    throw new Error('缺少 VITE_LLM_BASE_URL 配置')
  }
  if (!apiKey) {
    throw new Error('缺少 VITE_LLM_API_KEY 配置')
  }
  if (!model) {
    throw new Error('缺少 VITE_LLM_MODEL 配置')
  }
  // fetch是浏览器提供的一个函数,用于发送 HTTP 请求
  // 这里是 POST 请求,因为我们要发送消息给 deepseek 接口,而不是获取资源
  // 模板字符串拼接baseUrl和路径/chat/completions,拼成完整的请求地址
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    // headers的作用是  “告诉服务器：我发的是 JSON 数据，并且这是我的身份凭证。”
    headers: {
      // 表示这次发过去的数据格式是 JSON。
      'Content-Type': 'application/json',
      // 表示在请求头里带上身份认证信息。
      // Bearer 是常见的 token 认证格式。
      Authorization: `Bearer ${apiKey}`,
    },
    // 表示请求体，也就是你真正发给服务器的内容。
    body: JSON.stringify({
      model,
      messages: toDeepSeekMessages(messages),
      // 表示是否开启流式输出。
      // false 表示不开启流式输出，直接返回最终结果。
      // true 表示开启流式输出，服务器会分批返回结果，
      // 这里我们不开启流式输出，因为只需要最终结果。
      stream: false,
    }),
  })
  // response.json()表示把服务器返回的响应体解析成 JSON 对象。
  // 告诉 TypeScript：“我把这个返回结果当成 DeepSeekResponse 这种结构来处理。”
  const data = (await response.json()) as DeepSeekResponse
  // response.ok,这是 fetch 响应对象上的一个布尔值。如果请求状态是 200 到 299，一般就是 true。否则就是 false。
  if (!response.ok) {
    // 如果返回里有错误信息，就优先拿服务器给的错误信息。
    throw new Error(data.error?.message || '请求 DeepSeek 接口失败')
  }
  // 取得“DeepSeek 返回的第一条回复文本”。
  // 用可选链的目的是是为了避免某一层不存在时程序直接崩掉
  // “从 data 里，安全地取出 choices 数组第一项里的 message.content，如果取到了字符串，就顺便去掉首尾空格。”
  const replyText = data.choices?.[0]?.message?.content?.trim()
  if (!replyText) {
    throw new Error('DeepSeek 返回内容为空')
  }
  return replyText
}
