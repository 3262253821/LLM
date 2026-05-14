<script setup lang="ts">
import type { ChatModel } from '@/types/chat'

interface Props {
  modelValue: ChatModel
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ChatModel): void
}>()

// options 表示当前下拉框里可选的模型列表
const options: Array<{ label: string; value: ChatModel }> = [
  {
    label: 'DeepSeek V4 Flash',
    value: 'deepseek-v4-flash',
  },
  {
    label: 'DeepSeek V4 Pro',
    value: 'deepseek-v4-pro',
  },
]

// 监听 select 变化，把当前选中的模型值传给父组件
function onChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value as ChatModel)
}
</script>

<template>
  <div class="model-select-panel">
    <div class="model-select-panel__header">
      <div class="model-select-panel__title">模型选择</div>
      <div class="model-select-panel__desc">
        选择本次对话默认使用的模型。不同模型的效果和成本不同。
      </div>
    </div>

    <select
      class="model-select-panel__select"
      :value="props.modelValue"
      :disabled="props.loading"
      @change="onChange"
    >
      <option v-for="item in options" :key="item.value" :value="item.value">
        {{ item.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.model-select-panel {
  padding: 12px 12px 0;
}

.model-select-panel__header {
  margin-bottom: 8px;
}

.model-select-panel__title {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.model-select-panel__desc {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.model-select-panel__select {
  width: 100%;
  height: 40px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0 12px;
  font: inherit;
  color: #0f172a;
  background: #fff;
}
</style>
