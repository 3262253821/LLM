// import type明确表示只导入类型，不导入实现。
import type { MessageItem } from '@/types/chat'

// 定义 DeepSeekMessage 接口，用于表示"发给deepseek的消息应该符合的格式"
interface DeepSeekMessage {
  // 角色，可以是 system、user 或 assistant
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekStreamChoice {
  // 这里定义的delta不能随便起名,而是要和deepseek接口定义的一致或根据后端接口定义
  // 与之前版本的message区别就是，之前message是一整条消息；而delta是流式输出的一段段消息。
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
// 流式输出最核心的函数声明
export async function sendChatMessageStream(
  messages: MessageItem[],
  // 第二个参数是一个回调函数，每当流式返回一小段文本时，就把这段文本交给它处理
  onChunk: (chunkText: string) => void,
  // 第三个参数是可选的终止信号，用来支持“停止生成”
  signal?: AbortSignal,
): Promise<string> {
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
      // 告诉服务器：我希望你返回的是流式事件流，而不是普通一次性 JSON。
      Accept: 'text/event-stream',
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
      stream: true,
    }),
    // 把外面传进来的 signal 交给 fetch，这样外部就可以主动中断这次请求
    signal,
  })
  // 如果这次 HTTP 请求本身就失败了，那就先走错误处理，不进入后面的流式读取逻辑。
  // 如果响应状态不是成功状态，比如 400、401、500 之类，就进入这里。200-299 是成功状态。
  if (!response.ok) {
    // 尝试把错误响应解析成JSON，后面的catch则是如果解析失败，别让程序在这报错，而是直接null
    const data = (await response.json().catch(() => null)) as DeepSeekStreamChunk | null
    throw new Error(data?.error?.message || '请求 DeepSeek 接口失败')
  }
  // 如果响应体里根本没有 body 可读流，那就直接报错。
  if (!response.body) {
    throw new Error('当前环境不支持流式读取')
  }
  // 从响应体 response.body 里面拿到一个“读取器”。
  // 这个读取器专门用来做一件事：一段一段读取流式返回的数据。
  // getReader()作用是：给这个可读流申请一个读取器，然后你就可以手动一段一段去读里面的数据。
  const reader = response.body.getReader()
  // 创建一个文本解码器，用来把读出来的二进制数据转成正常字符串。
  const decoder = new TextDecoder('utf-8')
  // 先准备一个空字符串，用来保存最终完整回答。
  let fullText = ''
  // 再准备一个缓冲区字符串，先临时存放每次读到的原始文本数据
  // 因为有时候一次 read() 拿到的数据不一定刚好是一个完整事件，可能只是一半，所以要先放进 buffer 里缓冲一下。
  let buffer = ''
  // 定义一个内部函数，用来处理“单个完整事件文本”。
  // 当前面从流里读到一段完整 SSE 事件后，就交给这个函数来拆解和处理。
  const handleEvent = (eventText: string) => {
    // 先把eventText按换行拆成多行，再把每一行前后的空格去掉，再把空行删掉，最终得到干净的lines
    const lines = eventText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    // 开始遍历这些行，一行行处理
    for (const line of lines) {
      // 如果某一行不是以 data: 开头，就跳过它。
      if (!line.startsWith('data:')) continue
      // slice(n),是从索引n开始截取，直到字符串结束
      // 这里面5是截取'data: '(:后面又空格，也算一个字符)后面的内容
      // 例如'data: hello'得到的是hello
      const dataText = line.slice(5).trim()
      // 如果服务器返回的是 [DONE]，那说明流式输出结束了。
      if (dataText === '[DONE]') {
        continue
      }

      const chunk = JSON.parse(dataText) as DeepSeekStreamChunk
      // 从这次流式返回的数据块里，取出真正的那一小段文本内容。
      const chunkText = chunk.choices?.[0]?.delta?.content ?? ''

      if (!chunkText) continue
      // 把这次新拿到的一小段文本，拼接到最终完整字符串后面。
      fullText += chunkText
      // 每拿到一小段真实文本，就立刻调用外面传进来的回调函数。
      onChunk(chunkText)
    }
  }
  // 再定义一个内部函数，用来专门处理当前缓冲区里的内容。
  const consumeBuffer = () => {
    // 按两个换行符把缓冲区拆成多个事件块。
    // split()函数的作用是：把字符串按指定的分隔符拆分成多个字符串。
    // 这里按两个换行符拆分成多个事件块。
    // 每个事件块都是一个完整的 SSE 事件文本。
    const events = buffer.split('\n\n')
    // pop是取出数组最后一个元素。
    // 这里取出最后一个事件块，因为最后一个事件块可能不完整，所以要等下一次读取数据后再处理。
    buffer = events.pop() ?? ''
    // 把当前已经确定完整的那些事件，逐个交给 handleEvent 处理。
    for (const event of events) {
      handleEvent(event)
    }
  }

  while (true) {
    // 从流里读取下一段数据。value：这次读到的数据；done：是否已经读完
    const { value, done } = await reader.read()
    // 如果流已经读完了，就执行收尾处理，然后退出循环。
    if (done) {
      buffer += decoder.decode()
      break
    }

    buffer += decoder.decode(value, { stream: true })
    consumeBuffer()
  }
  // 每次往 buffer 里追加了新内容之后，就立刻尝试把里面已经完整的数据事件取出来处理。
  consumeBuffer()

  if (buffer.trim()) {
    handleEvent(buffer)
  }

  const replyText = fullText.trim()

  if (!replyText) {
    throw new Error('DeepSeek 返回内容为空')
  }

  return replyText
}
