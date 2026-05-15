<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import type { ThemeMode } from '@/types/theme'

const themeStore = useThemeStore()
const { mode, resolvedTheme } = storeToRefs(themeStore)

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const options: Array<{ label: string; value: ThemeMode }> = [
  {
    label: '跟随系统',
    value: 'system',
  },
  {
    label: '亮色主题',
    value: 'light',
  },
  {
    label: '暗色主题',
    value: 'dark',
  },
]

const currentLabel = computed(() => {
  return options.find((item) => item.value === mode.value)?.label ?? '主题模式'
})

function toggleOpen() {
  open.value = !open.value
}

function selectMode(value: ThemeMode) {
  themeStore.setMode(value)
  open.value = false
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node | null

  if (rootRef.value && target && !rootRef.value.contains(target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="rootRef" class="theme-dropdown">
    <button
      class="theme-dropdown__trigger"
      :title="currentLabel"
      :aria-label="currentLabel"
      @click.stop="toggleOpen"
    >
      <svg
        v-if="mode === 'system'"
        class="theme-dropdown__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="3.5" y="4.5" width="17" height="11" rx="2" />
        <path d="M8 19.5H16" />
        <path d="M12 15.5V19.5" />
      </svg>

      <svg
        v-else-if="resolvedTheme === 'light'"
        class="theme-dropdown__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5V5" />
        <path d="M12 19V21.5" />
        <path d="M4.93 4.93L6.7 6.7" />
        <path d="M17.3 17.3L19.07 19.07" />
        <path d="M2.5 12H5" />
        <path d="M19 12H21.5" />
        <path d="M4.93 19.07L6.7 17.3" />
        <path d="M17.3 6.7L19.07 4.93" />
      </svg>

      <svg
        v-else
        class="theme-dropdown__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3A6.8 6.8 0 0 0 21 12.8Z" />
      </svg>
    </button>

    <div v-if="open" class="theme-dropdown__menu">
      <button
        v-for="item in options"
        :key="item.value"
        class="theme-dropdown__item"
        :class="{ 'is-active': item.value === mode }"
        @click="selectMode(item.value)"
      >
        <span class="theme-dropdown__item-icon">
          <svg
            v-if="item.value === 'system'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="3.5" y="4.5" width="17" height="11" rx="2" />
            <path d="M8 19.5H16" />
            <path d="M12 15.5V19.5" />
          </svg>
          <svg
            v-else-if="item.value === 'light'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5V5" />
            <path d="M12 19V21.5" />
            <path d="M4.93 4.93L6.7 6.7" />
            <path d="M17.3 17.3L19.07 19.07" />
            <path d="M2.5 12H5" />
            <path d="M19 12H21.5" />
            <path d="M4.93 19.07L6.7 17.3" />
            <path d="M17.3 6.7L19.07 4.93" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3A6.8 6.8 0 0 0 21 12.8Z" />
          </svg>
        </span>
        <span>{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.theme-dropdown {
  position: relative;
}

.theme-dropdown__trigger {
  width: 38px;
  height: 38px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-primary);
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.theme-dropdown__trigger:hover {
  border-color: var(--app-success);
  color: var(--app-success);
}

.theme-dropdown__icon {
  width: 18px;
  height: 18px;
}

.theme-dropdown__menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 168px;
  padding: 8px;
  border: 1px solid var(--app-border);
  border-radius: 16px;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
  z-index: 30;
}

.theme-dropdown__item {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--app-text-primary);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-align: left;
}

.theme-dropdown__item:hover {
  background: var(--app-surface-soft);
}

.theme-dropdown__item.is-active {
  background: var(--app-success-soft);
  color: var(--app-success);
}

.theme-dropdown__item-icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.theme-dropdown__item-icon svg {
  width: 18px;
  height: 18px;
}
</style>
