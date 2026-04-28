<script setup lang="ts">
import { computed, ref } from 'vue'
const emit = defineEmits<{
  (e: 'send-message', text: string): void
}>()
const text = ref('')
const canSend = computed(() => text.value.trim().length > 0)
function send() {
  const value = text.value.trim()
  if (!value) return
  emit('send-message', value)
  text.value = ''
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    // 阻止默认的 Enter 键行为，默认情况下在textarea中按Enter键会换行
    // 同时，触发发送消息的逻辑
    e.preventDefault()
    send()
  }
}
</script>
<template>
  <div class="message-input">
    <textarea
      v-model="text"
      class="message-input__textarea"
      placeholder="请输入消息,Enter 发送,Shift+Enter 换行"
      @keydown="onKeydown"
    />
    <button class="message-input__send-btn" :disabled="!canSend" @click="send">发送</button>
  </div>
</template>
<style scoped>
.message-input {
  display: flex;
  gap: 10px;
  padding: 12px;
}
.message-input__textarea {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  resize: vertical;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px;
  font: inherit;
}
.message-input__send-btn {
  width: 84px;
  border: none;
  border-radius: 10px;
  background: #22c55e;
  color: #fff;
  cursor: pointer;
}
.message-input__send-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
</style>
