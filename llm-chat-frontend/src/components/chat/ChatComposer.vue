<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ChatModel } from '@/types/chat'
import { debounce } from '@/utils/performance'

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

const COMPOSER_HEIGHT_STORAGE_KEY = 'llm-chat-frontend:composer-height'

const rootRef = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const openPanel = ref<'prompt' | 'temperature' | 'model' | null>(null)
const text = ref('')
const promptDraft = ref(props.systemPrompt)
const baseTextareaHeight = ref(72)
const isResizing = ref(false)

let resizeStartY = 0
let resizeStartHeight = 0

const canSend = computed(() => text.value.trim().length > 0)

const modelLabel = computed(() => {
  return props.model === 'deepseek-v4-pro' ? 'DeepSeek V4 Pro' : 'DeepSeek V4 Flash'
})

const temperatureTone = computed(() => {
  if (props.temperature <= 0.6) return '稳健'
  if (props.temperature >= 1.4) return '发散'
  return '均衡'
})

function getTextareaBounds() {
  const isNarrow = typeof window !== 'undefined' && window.innerWidth <= 640
  const min = isNarrow ? 56 : 72
  const viewportMax =
    typeof window !== 'undefined'
      ? Math.floor(window.innerHeight * (isNarrow ? 0.24 : 0.26))
      : 220
  const max = Math.max(min + 72, Math.min(isNarrow ? 200 : 240, viewportMax))

  return { min, max }
}

function clampTextareaHeight(value: number) {
  const { min, max } = getTextareaBounds()
  return Math.min(max, Math.max(min, Math.round(value)))
}

function loadComposerHeightPreference() {
  if (typeof window === 'undefined') return

  const stored = Number(window.localStorage.getItem(COMPOSER_HEIGHT_STORAGE_KEY))
  const fallback = getTextareaBounds().min

  baseTextareaHeight.value = clampTextareaHeight(Number.isFinite(stored) ? stored : fallback)
}

function saveComposerHeightPreference() {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(COMPOSER_HEIGHT_STORAGE_KEY, String(baseTextareaHeight.value))
}

const resizeComposer = debounce(() => {
  const textarea = textareaRef.value

  if (!textarea) return

  const { max } = getTextareaBounds()
  const preferredHeight = clampTextareaHeight(baseTextareaHeight.value)

  baseTextareaHeight.value = preferredHeight
  textarea.style.height = 'auto'
  textarea.style.height = `${Math.max(preferredHeight, Math.min(textarea.scrollHeight, max))}px`
}, 16)

watch(
  () => props.systemPrompt,
  (value) => {
    if (openPanel.value !== 'prompt') {
      promptDraft.value = value
    }
  },
)

watch(text, async () => {
  await nextTick()
  resizeComposer()
})

function send() {
  const value = text.value.trim()
  if (!value) return

  emit('send-message', value)
  text.value = ''
  resizeComposer()
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

function handleInput() {
  resizeComposer()
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

function cleanupResizeListeners() {
  window.removeEventListener('pointermove', handleResizeMove)
  window.removeEventListener('pointerup', stopResize)
  window.removeEventListener('pointercancel', stopResize)
}

function handleResizeMove(event: PointerEvent) {
  if (!isResizing.value) return

  baseTextareaHeight.value = clampTextareaHeight(resizeStartHeight + resizeStartY - event.clientY)
  resizeComposer()
}

function stopResize() {
  if (!isResizing.value) return

  isResizing.value = false
  cleanupResizeListeners()
  document.body.style.removeProperty('user-select')
  saveComposerHeightPreference()
  resizeComposer()
}

function startResize(event: PointerEvent) {
  const textarea = textareaRef.value

  if (!textarea) return

  resizeStartY = event.clientY
  resizeStartHeight = textarea.getBoundingClientRect().height
  isResizing.value = true
  document.body.style.userSelect = 'none'

  window.addEventListener('pointermove', handleResizeMove)
  window.addEventListener('pointerup', stopResize)
  window.addEventListener('pointercancel', stopResize)
}

function handleViewportResize() {
  baseTextareaHeight.value = clampTextareaHeight(baseTextareaHeight.value)
  resizeComposer()
}

onMounted(() => {
  loadComposerHeightPreference()
  resizeComposer()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleViewportResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleViewportResize)
  cleanupResizeListeners()
  document.body.style.removeProperty('user-select')
  resizeComposer.cancel()
})
</script>

<template>
  <div ref="rootRef" class="chat-composer" :class="{ 'is-resizing': isResizing }">
    <div class="chat-composer__head">
      <div>
        <p class="chat-composer__eyebrow">Prompt Dock</p>
        <h3 class="chat-composer__title">输入你的问题、任务或指令</h3>
      </div>

      <div class="chat-composer__summary-pills">
        <span>{{ modelLabel }}</span>
        <span>Temperature {{ props.temperature.toFixed(1) }} · {{ temperatureTone }}</span>
      </div>
    </div>

    <button
      class="chat-composer__resize-handle"
      type="button"
      aria-label="调整输入框高度"
      @pointerdown.prevent="startResize"
    >
      <span></span>
    </button>

    <textarea
      ref="textareaRef"
      v-model="text"
      class="chat-composer__textarea"
      :disabled="props.loading"
      placeholder="给 DeepSeek 发送消息，支持多行输入与 Markdown 内容。"
      rows="1"
      @keydown="onKeydown"
      @input="handleInput"
    />

    <div class="chat-composer__footer">
      <div class="chat-composer__tools">
        <div class="chat-composer__tool-wrap">
          <button
            class="chat-composer__tool"
            :class="{ 'is-active': openPanel === 'prompt' }"
            type="button"
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
              placeholder="例如：你是一名前端架构师，请用清晰、结构化的方式回答。"
            />
            <div class="chat-composer__panel-actions">
              <button class="chat-composer__ghost-btn" type="button" @click="closePanels">关闭</button>
              <button class="chat-composer__confirm-btn" type="button" @click="savePrompt(); openPanel = null">
                确认
              </button>
            </div>
          </div>
        </div>

        <div class="chat-composer__tool-wrap">
          <button
            class="chat-composer__tool"
            :class="{ 'is-active': openPanel === 'temperature' }"
            type="button"
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
            <div class="chat-composer__panel-foot">当前风格：{{ temperatureTone }}</div>
          </div>
        </div>

        <div class="chat-composer__tool-wrap">
          <button
            class="chat-composer__tool"
            :class="{ 'is-active': openPanel === 'model' }"
            type="button"
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
                type="button"
                :class="{ 'is-selected': props.model === 'deepseek-v4-flash' }"
                @click="updateModel('deepseek-v4-flash')"
              >
                DeepSeek V4 Flash
              </button>
              <button
                class="chat-composer__model-option"
                type="button"
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
          <span>Enter 发送</span>
          <span>Shift + Enter 换行</span>
          <span v-if="props.systemPrompt.trim()">已启用自定义系统提示词</span>
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
  margin: 14px 18px 18px;
  padding: 16px 18px 18px;
  border: 1px solid var(--app-border);
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.08), transparent 34%),
    var(--app-surface-elevated);
  box-shadow: 0 22px 42px rgba(15, 23, 42, 0.08);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.chat-composer.is-resizing {
  border-color: rgba(15, 118, 110, 0.24);
  box-shadow: 0 26px 48px rgba(15, 118, 110, 0.14);
}

.chat-composer::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.22), transparent 55%);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: 1px;
}

.chat-composer__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 8px;
}

.chat-composer__eyebrow {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--app-text-tertiary);
}

.chat-composer__title {
  margin: 0;
  font-size: 18px;
  color: var(--app-text-primary);
}

.chat-composer__summary-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.chat-composer__summary-pills span {
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.54);
  border: 1px solid rgba(15, 23, 42, 0.05);
  color: var(--app-text-secondary);
  font-size: 12px;
}

.chat-composer__resize-handle {
  width: 100%;
  height: 18px;
  margin: -2px 0 8px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ns-resize;
  touch-action: none;
}

.chat-composer__resize-handle span {
  width: min(108px, 24%);
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(15, 118, 110, 0.24), rgba(100, 116, 139, 0.28));
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, background 0.2s ease;
}

.chat-composer__resize-handle:hover span,
.chat-composer.is-resizing .chat-composer__resize-handle span {
  transform: scaleX(1.08);
  background: linear-gradient(90deg, rgba(15, 118, 110, 0.42), rgba(14, 165, 233, 0.3));
}

.chat-composer__textarea {
  width: 100%;
  min-height: 56px;
  max-height: min(240px, 26dvh);
  border: none;
  resize: none;
  overflow: auto;
  padding: 0;
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
  margin-top: 16px;
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
  background: rgba(255, 255, 255, 0.62);
  color: var(--app-text-primary);
  border-radius: 999px;
  padding: 10px 14px;
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
  border-color: rgba(15, 118, 110, 0.24);
  background: rgba(15, 118, 110, 0.1);
  color: var(--app-primary);
}

.chat-composer__panel {
  position: absolute;
  left: 0;
  bottom: calc(100% + 12px);
  min-width: 300px;
  max-width: min(420px, calc(100vw - 52px));
  padding: 14px;
  border: 1px solid var(--app-border);
  border-radius: 18px;
  background: var(--app-surface-elevated);
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

.chat-composer__panel-foot {
  margin-top: 10px;
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
  background: var(--app-primary);
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
  background: rgba(255, 255, 255, 0.66);
  color: var(--app-text-primary);
  border-radius: 14px;
  padding: 11px 12px;
  text-align: left;
  cursor: pointer;
}

.chat-composer__model-option.is-selected {
  border-color: rgba(15, 118, 110, 0.22);
  background: rgba(15, 118, 110, 0.1);
  color: var(--app-primary);
}

.chat-composer__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-composer__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: var(--app-text-secondary);
}

.chat-composer__summary span {
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.52);
  border: 1px solid rgba(15, 23, 42, 0.05);
}

.chat-composer__submit {
  min-width: 84px;
  height: 46px;
  border: none;
  border-radius: 999px;
  padding: 0 20px;
  background: var(--app-primary);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 18px 28px rgba(15, 118, 110, 0.18);
}

.chat-composer__submit:disabled {
  background: var(--app-text-tertiary);
  cursor: not-allowed;
}

.chat-composer__submit--stop {
  background: var(--app-warning);
  box-shadow: 0 18px 28px rgba(249, 115, 22, 0.18);
}

@media (max-width: 900px) {
  .chat-composer {
    margin: 14px;
    padding: 14px 16px 16px;
    border-radius: 24px;
  }

  .chat-composer__head {
    flex-direction: column;
  }

  .chat-composer__summary-pills {
    justify-content: flex-start;
  }

  .chat-composer__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .chat-composer__actions {
    justify-content: space-between;
    align-items: flex-start;
    flex-direction: column;
  }

  .chat-composer__panel {
    left: 0;
    right: 0;
    min-width: 0;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .chat-composer {
    margin: 12px;
    padding: 12px 14px 14px;
  }

  .chat-composer__tool {
    width: 100%;
    justify-content: center;
  }

  .chat-composer__tool-wrap {
    width: 100%;
  }

  .chat-composer__summary {
    width: 100%;
  }

  .chat-composer__actions {
    width: 100%;
  }

  .chat-composer__submit {
    width: 100%;
  }

  .chat-composer__resize-handle span {
    width: min(112px, 32%);
  }
}
</style>
