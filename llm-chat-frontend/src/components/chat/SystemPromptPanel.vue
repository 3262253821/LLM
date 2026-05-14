<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// 用 computed 包一层，是为了让 textarea 可以像 v-model 一样使用。
// 但真正的数据不在这个子组件里，而是在父组件和 store 里。
const promptValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>

<template>
  <div class="system-prompt-panel">
    <div class="system-prompt-panel__header">
      <div class="system-prompt-panel__title">系统提示词</div>
      <div class="system-prompt-panel__desc">
        每次发送消息前，都会先把这段内容作为 system 消息发给模型。
      </div>
    </div>

    <textarea
      v-model="promptValue"
      class="system-prompt-panel__textarea"
      :disabled="props.loading"
      placeholder="例如：你是一名耐心的前端导师，请用清晰、结构化的方式回答。"
    />
  </div>
</template>

<style scoped>
.system-prompt-panel {
  padding: 12px 12px 0;
}

.system-prompt-panel__header {
  margin-bottom: 8px;
}

.system-prompt-panel__title {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.system-prompt-panel__desc {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.system-prompt-panel__textarea {
  width: 100%;
  min-height: 72px;
  resize: vertical;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  font: inherit;
  line-height: 1.6;
  color: #0f172a;
  background: #fff;
  box-sizing: border-box;
}
</style>
