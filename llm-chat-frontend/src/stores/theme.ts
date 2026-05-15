import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { loadThemeMode, saveThemeMode } from '@/utils/themeStorage'
import type { ResolvedTheme, ThemeMode } from '@/types/theme'

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('system')
  const systemTheme = ref<ResolvedTheme>('light')
  const inited = ref(false)

  const resolvedTheme = computed<ResolvedTheme>(() => {
    return mode.value === 'system' ? systemTheme.value : mode.value
  })

  function applyTheme() {
    const theme = resolvedTheme.value
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }

  function setMode(value: ThemeMode) {
    mode.value = value
    saveThemeMode(value)
    applyTheme()
  }

  function init() {
    if (inited.value) return

    mode.value = loadThemeMode() ?? 'system'
    systemTheme.value = getSystemTheme()
    applyTheme()

    const media = window.matchMedia('(prefers-color-scheme: dark)')

    media.addEventListener('change', (event) => {
      systemTheme.value = event.matches ? 'dark' : 'light'

      if (mode.value === 'system') {
        applyTheme()
      }
    })

    inited.value = true
  }

  return {
    mode,
    resolvedTheme,
    init,
    setMode,
  }
})
