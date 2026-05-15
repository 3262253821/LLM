<script setup lang="ts">
import type { ThemeMode } from '@/types/theme'

interface Props {
  modelValue: ThemeMode
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ThemeMode): void
}>()

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

function onChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value as ThemeMode)
}
</script>

<template>
  <div class="theme-select-panel">
    <div class="theme-select-panel__header">
      <div class="theme-select-panel__title">主题模式</div>
      <div class="theme-select-panel__desc">支持跟随系统、亮色主题、暗色主题三种模式切换。</div>
    </div>

    <select class="theme-select-panel__select" :value="props.modelValue" @change="onChange">
      <option v-for="item in options" :key="item.value" :value="item.value">
        {{ item.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.theme-select-panel {
  padding: 12px 12px 0;
}

.theme-select-panel__header {
  margin-bottom: 8px;
}

.theme-select-panel__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text-primary);
}

.theme-select-panel__desc {
  margin-top: 4px;
  font-size: 12px;
  color: var(--app-text-secondary);
}

.theme-select-panel__select {
  width: 100%;
  height: 40px;
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 0 12px;
  font: inherit;
  color: var(--app-text-primary);
  background: var(--app-surface);
}
</style>
