import type { ThemeMode } from '@/types/theme'

const THEME_STORAGE_KEY = 'llm-chat-frontend:theme-mode'

export function loadThemeMode(): ThemeMode | null {
  const raw = localStorage.getItem(THEME_STORAGE_KEY)

  if (raw === 'system' || raw === 'light' || raw === 'dark') {
    return raw
  }

  return null
}

export function saveThemeMode(mode: ThemeMode) {
  localStorage.setItem(THEME_STORAGE_KEY, mode)
}
