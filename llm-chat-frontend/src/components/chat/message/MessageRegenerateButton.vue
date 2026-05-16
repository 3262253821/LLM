<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const buttonTitle = computed(() => {
  return props.disabled ? '暂时无法重新回答' : '重新回答'
})

function handleClick() {
  if (props.disabled) return
  emit('click')
}
</script>

<template>
  <button
    type="button"
    class="regenerate-button"
    :disabled="props.disabled"
    :title="buttonTitle"
    :aria-label="buttonTitle"
    @click="handleClick"
  >
    <svg
      class="regenerate-button__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M20 11A8 8 0 0 0 6.28 5.34" />
      <path d="M4 4V8H8" />
      <path d="M4 13A8 8 0 0 0 17.72 18.66" />
      <path d="M20 20V16H16" />
    </svg>

    <span class="regenerate-button__text">重新回答</span>
  </button>
</template>

<style scoped>
.regenerate-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--app-text-tertiary);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.regenerate-button:hover {
  color: var(--app-text-primary);
  background: rgba(15, 118, 110, 0.08);
}

.regenerate-button:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
  background: transparent;
}

.regenerate-button__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.regenerate-button__text {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
