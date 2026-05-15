import type { ChatPersistedState } from '@/types/chat'
import { request } from '@/utils/request'

interface ChatStateResponse {
  state: ChatPersistedState | null
}

export async function fetchChatState() {
  const data = await request<ChatStateResponse>('/api/chat/state', {
    auth: true,
  })

  return data.state
}

export async function saveRemoteChatState(state: ChatPersistedState) {
  return request<{ ok?: boolean }>('/api/chat/state', {
    method: 'PUT',
    auth: true,
    body: {
      state,
    },
  })
}
