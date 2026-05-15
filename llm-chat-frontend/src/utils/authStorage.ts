import type { AuthPersistedState } from '@/types/auth'

const AUTH_STORAGE_KEY = 'llm-chat-frontend:auth-state'

export function loadAuthState(): AuthPersistedState | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthPersistedState
  } catch (error) {
    console.error('读取登录缓存失败：', error)
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function saveAuthState(state: AuthPersistedState) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state))
}

export function clearAuthState() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
