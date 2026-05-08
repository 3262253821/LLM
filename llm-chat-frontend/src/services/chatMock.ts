export function mockChatReply(text: string): Promise<string> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(`我收到了你的消息：“${text}”。下一步我们可以接真实 API。`)
    }, 700)
  })
}
