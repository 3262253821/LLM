<script setup lang="ts">
interface Props {
  modelValue: number
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

// 当滑块值变化时，把最新的 temperature 数值传给父组件。
function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', Number(target.value))
}
</script>

<template>
  <div class="temperature-panel">
    <div class="temperature-panel__header">
      <div class="temperature-panel__title">Temperature</div>
      <div class="temperature-panel__desc">控制回答的随机性。越低越稳定，越高越发散。</div>
    </div>

    <div class="temperature-panel__control">
      <input
        class="temperature-panel__slider"
        type="range"
        min="0"
        max="2"
        step="0.1"
        :value="props.modelValue"
        :disabled="props.loading"
        @input="onInput"
      />

      <span class="temperature-panel__value">{{ props.modelValue.toFixed(1) }}</span>
    </div>

    <div class="temperature-panel__tips">
      <span>0.0：更稳定</span>
      <span>2.0：更发散</span>
    </div>
  </div>
</template>

<style scoped>
.temperature-panel {
  padding: 12px 12px 0;
}

.temperature-panel__header {
  margin-bottom: 8px;
}

.temperature-panel__title {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.temperature-panel__desc {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.temperature-panel__control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.temperature-panel__slider {
  flex: 1;
}

.temperature-panel__value {
  min-width: 36px;
  font-size: 13px;
  color: #334155;
  text-align: right;
}

.temperature-panel__tips {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  color: #94a3b8;
}
</style>
