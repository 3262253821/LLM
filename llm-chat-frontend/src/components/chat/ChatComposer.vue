<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ChatModel } from '@/types/chat'

interface Props {
  loading: boolean
  systemPrompt: string
  temperature: number
  model: ChatModel
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'send-message', text: string): void
  (e: 'stop-generate'): void
  (e: 'update:systemPrompt', value: string): void
  (e: 'update:temperature', value: number): void
  (e: 'update:model', value: ChatModel): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const openPanel = ref<'prompt' | 'temperature' | 'model' | null>(null)
const text = ref('')
const promptDraft = ref(props.systemPrompt)

const canSend = computed(() => text.value.trim().length > 0)

const modelLabel = computed(() => {
  return props.model === 'deepseek-v4-pro' ? 'DeepSeek V4 Pro' : 'DeepSeek V4 Flash'
})

watch(
  () => props.systemPrompt,
  (value) => {
    if (openPanel.value !== 'prompt') {
      promptDraft.value = value
    }
  },
)

function send() {
  const value = text.value.trim()
  if (!value) return
  emit('send-message', value)
  text.value = ''
}

function stopGenerate() {
  emit('stop-generate')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    send()
  }
}

function savePrompt() {
  const nextValue = promptDraft.value.trim()

  if (nextValue !== props.systemPrompt) {
    emit('update:systemPrompt', nextValue)
  }
}

function togglePanel(panel: 'prompt' | 'temperature' | 'model') {
  if (openPanel.value === 'prompt' && panel !== 'prompt') {
    savePrompt()
  }

  openPanel.value = openPanel.value === panel ? null : panel

  if (panel === 'prompt' && openPanel.value === 'prompt') {
    promptDraft.value = props.systemPrompt
  }
}

function closePanels() {
  if (openPanel.value === 'prompt') {
    savePrompt()
  }

  openPanel.value = null
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node | null

  if (rootRef.value && target && !rootRef.value.contains(target)) {
    closePanels()
  }
}

function updateTemperature(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:temperature', Number(target.value))
}

function updateModel(value: ChatModel) {
  emit('update:model', value)
  openPanel.value = null
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="rootRef" class="chat-composer">
    <textarea
      v-model="text"
      class="chat-composer__textarea"
      :disabled="props.loading"
      placeholder="给 DeepSeek 发送消息"
      @keydown="onKeydown"
    />

    <div class="chat-composer__footer">
      <div class="chat-composer__tools">
        <div class="chat-composer__tool-wrap">
          <button
            class="chat-composer__tool"
            :class="{ 'is-active': openPanel === 'prompt' }"
            @click.stop="togglePanel('prompt')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M4 19.5V16L14.2 5.8A2.12 2.12 0 0 1 17.2 8.8L7 19H4.5" />
              <path d="M12.5 7.5L16.5 11.5" />
            </svg>
            <span>系统提示词</span>
          </button>

          <div v-if="openPanel === 'prompt'" class="chat-composer__panel chat-composer__panel--prompt">
            <div class="chat-composer__panel-title">系统提示词</div>
            <textarea
              v-model="promptDraft"
              class="chat-composer__prompt-textarea"
              :disabled="props.loading"
              placeholder="例如：你是一名前端导师，请用清晰、结构化的方式回答。"
            />
            <div class="chat-composer__panel-actions">
              <button class="chat-composer__ghost-btn" @click="closePanels">关闭</button>
              <button class="chat-composer__confirm-btn" @click="savePrompt(); openPanel = null">
                确认
              </button>
            </div>
          </div>
        </div>

        <div class="chat-composer__tool-wrap">
          <button
            class="chat-composer__tool"
            :class="{ 'is-active': openPanel === 'temperature' }"
            @click.stop="togglePanel('temperature')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M8 6.5A3.5 3.5 0 1 1 15 6.5V13.2A5 5 0 1 1 8 13.2V6.5Z" />
              <path d="M12 10V17" />
            </svg>
            <span>Temperature</span>
          </button>

          <div
            v-if="openPanel === 'temperature'"
            class="chat-composer__panel chat-composer__panel--temperature"
          >
            <div class="chat-composer__panel-title">Temperature 随机性</div>
            <div class="chat-composer__panel-desc">越低越稳定，越高越发散。</div>
            <div class="chat-composer__slider-row">
              <input
                class="chat-composer__slider"
                type="range"
                min="0"
                max="2"
                step="0.1"
                :value="props.temperature"
                :disabled="props.loading"
                @input="updateTemperature"
              />
              <span class="chat-composer__slider-value">{{ props.temperature.toFixed(1) }}</span>
            </div>
          </div>
        </div>

        <div class="chat-composer__tool-wrap">
          <button
            class="chat-composer__tool"
            :class="{ 'is-active': openPanel === 'model' }"
            @click.stop="togglePanel('model')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 3L19 7V17L12 21L5 17V7L12 3Z" />
              <path d="M5 7L12 11L19 7" />
              <path d="M12 11V21" />
            </svg>
            <span>模型切换</span>
          </button>

          <div v-if="openPanel === 'model'" class="chat-composer__panel chat-composer__panel--model">
            <div class="chat-composer__panel-title">模型切换</div>
            <div class="chat-composer__model-options">
              <button
                class="chat-composer__model-option"
                :class="{ 'is-selected': props.model === 'deepseek-v4-flash' }"
                @click="updateModel('deepseek-v4-flash')"
              >
                DeepSeek V4 Flash
              </button>
              <button
                class="chat-composer__model-option"
                :class="{ 'is-selected': props.model === 'deepseek-v4-pro' }"
                @click="updateModel('deepseek-v4-pro')"
              >
                DeepSeek V4 Pro
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-composer__actions">
        <div class="chat-composer__summary">
          <span>{{ modelLabel }}</span>
        </div>

        <button
          v-if="props.loading"
          class="chat-composer__submit chat-composer__submit--stop"
          type="button"
          @click="stopGenerate"
        >
          停止
        </button>

        <button
          v-else
          class="chat-composer__submit"
          type="button"
          :disabled="!canSend"
          @click="send"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-composer {
  position: relative;
  margin: 14px 16px 16px;
  padding: 16px;
  border: 1px solid var(--app-border);
  border-radius: 24px;
  background: var(--app-surface);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
}

.chat-composer__textarea {
  width: 100%;
  min-height: 112px;
  border: none;
  resize: none;
  padding: 2px 0;
  font: inherit;
  font-size: 16px;
  line-height: 1.7;
  color: var(--app-text-primary);
  background: transparent;
  outline: none;
}

.chat-composer__textarea::placeholder {
  color: var(--app-text-tertiary);
}

.chat-composer__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 14px;
}

.chat-composer__tools {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.chat-composer__tool-wrap {
  position: relative;
}

.chat-composer__tool {
  border: 1px solid var(--app-border);
  background: var(--app-surface-soft);
  color: var(--app-text-primary);
  border-radius: 999px;
  padding: 9px 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.chat-composer__tool svg {
  width: 16px;
  height: 16px;
}

.chat-composer__tool.is-active {
  border-color: var(--app-success);
  background: var(--app-success-soft);
  color: var(--app-success);
}

.chat-composer__panel {
  position: absolute;
  left: 0;
  bottom: calc(100% + 12px);
  min-width: 300px;
  max-width: 420px;
  padding: 14px;
  border: 1px solid var(--app-border);
  border-radius: 18px;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
  z-index: 30;
}

.chat-composer__panel--prompt {
  width: 360px;
}

.chat-composer__panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text-primary);
}

.chat-composer__panel-desc {
  margin-top: 6px;
  font-size: 12px;
  color: var(--app-text-secondary);
}

.chat-composer__prompt-textarea {
  width: 100%;
  min-height: 120px;
  margin-top: 12px;
  border: 1px solid var(--app-border-strong);
  border-radius: 14px;
  padding: 12px;
  font: inherit;
  line-height: 1.6;
  color: var(--app-text-primary);
  background: var(--app-surface);
  resize: vertical;
}

.chat-composer__panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.chat-composer__ghost-btn,
.chat-composer__confirm-btn {
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
}

.chat-composer__ghost-btn {
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-secondary);
}

.chat-composer__confirm-btn {
  border: none;
  background: var(--app-success);
  color: #fff;
}

.chat-composer__slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.chat-composer__slider {
  flex: 1;
}

.chat-composer__slider-value {
  min-width: 36px;
  text-align: right;
  color: var(--app-text-primary);
}

.chat-composer__model-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.chat-composer__model-option {
  border: 1px solid var(--app-border);
  background: var(--app-surface-soft);
  color: var(--app-text-primary);
  border-radius: 14px;
  padding: 11px 12px;
  text-align: left;
  cursor: pointer;
}

.chat-composer__model-option.is-selected {
  border-color: var(--app-success);
  background: var(--app-success-soft);
  color: var(--app-success);
}

.chat-composer__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-composer__summary {
  font-size: 12px;
  color: var(--app-text-secondary);
  white-space: nowrap;
}

.chat-composer__submit {
  min-width: 72px;
  height: 44px;
  border: none;
  border-radius: 999px;
  padding: 0 20px;
  background: var(--app-success);
  color: #fff;
  cursor: pointer;
}

.chat-composer__submit:disabled {
  background: var(--app-text-tertiary);
  cursor: not-allowed;
}

.chat-composer__submit--stop {
  background: var(--app-warning);
}

@media (max-width: 900px) {
  .chat-composer__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .chat-composer__actions {
    justify-content: space-between;
  }

  .chat-composer__panel {
    left: 0;
    right: 0;
    min-width: 0;
    width: 100%;
  }
}
</style>
