// 这个函数是之前用于模拟 DeepSeek 接口的,使用定时器模拟异步延迟,现在已经没有用了,
// 但是为了留下痕迹,这里保留着。
export function mockChatReply(text: string): Promise<string> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(`我收到了你的消息：“${text}”。下一步我们可以接真实 API。`)
    }, 700)
  })
}
