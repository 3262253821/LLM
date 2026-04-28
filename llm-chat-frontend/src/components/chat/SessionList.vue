<script setup lang="ts">
import type { SessionItem } from '@/types/chat'
interface Props {
  sessions: SessionItem[]
  activeSessionId: number
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'select-session', id: number): void
  (e: 'create-session'): void
}>()
function onSelect(id: number) {
  emit('select-session', id)
}
function onCreate() {
  emit('create-session')
}
</script>
<template>
  <div class="session-list">
    <div class="session-list__top">
      <button class="session-list__new-btn" @click="onCreate">+ 新建会话</button>
    </div>
    <div class="session-list__body">
      <button
        v-for="item in props.sessions"
        :key="item.id"
        class="session-list__item"
        :class="{ 'is-active': item.id === props.activeSessionId }"
        @click="onSelect(item.id)"
      >
        {{ item.title }}
      </button>
    </div>
  </div>
</template>
<style scoped>
.session-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.session-list__top {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
}
.session-list__new-btn {
  width: 100%;
  border: 1px dashed #94a3b8;
  background: #fff;
  color: #334155;
  border-radius: 8px;
  height: 36px;
  cursor: pointer;
}
.session-list__body {
  padding: 10px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.session-list__item {
  text-align: left;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  color: #334155;
  cursor: pointer;
}
.session-list__item:hover {
  background: #f8fafc;
}
.session-list__item.is-active {
  border-color: #22c55e;
  color: #166534;
  background: #f0fdf4;
}
</style>
