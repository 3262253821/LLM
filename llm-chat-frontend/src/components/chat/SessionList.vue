<script setup lang="ts">
import { ref } from 'vue'
import type { SessionItem } from '@/types/chat'

interface Props {
  sessions: SessionItem[]
  activeSessionId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-session', id: number): void
  (e: 'create-session'): void
  (e: 'del-session', id: number): void
  (e: 'rename-session', id: number, title: string): void
}>()

// 当前正在编辑哪个会话的id
const editingId = ref<number | null>(null)
// 当前正在编辑的标题内容
const editingTitle = ref('')

function onSelect(id: number) {
  // 如果当前这个会话这个在编辑名字，点击时就先不要切换会话
  if (editingId.value === id) return
  emit('select-session', id)
}

function onCreate() {
  emit('create-session')
}

function delSession(id: number) {
  emit('del-session', id)
}
// 开始改名（重命名）
function startRename(item: SessionItem) {
  // 记录当前正在编辑的是哪个会话
  editingId.value = item.id
  // 把当前会话原来的标题先放进输入框里，方便修改
  editingTitle.value = item.title
}
// 保存改名
function saveRename(id: number) {
  const title = editingTitle.value.trim() || '未命名会话'
  emit('rename-session', id, title)
  // 退出编辑状态
  editingId.value = null
  editingTitle.value = ''
}
// 取消改名
function cancelRename() {
  editingId.value = null
  editingTitle.value = ''
}
// 处理改名的键盘事件
function handleRenameKeydown(event: KeyboardEvent, id: number) {
  if (event.key === 'Enter') {
    event.preventDefault()
    saveRename(id)
  }

  if (event.key === 'Escape') cancelRename()
}
</script>

<template>
  <div class="session-list">
    <div class="session-list__top">
      <button class="session-list__new-btn" @click="onCreate">+ 新建会话</button>
    </div>

    <div class="session-list__body">
      <div
        v-for="item in props.sessions"
        :key="item.id"
        class="session-list__item"
        :class="{ 'is-active': item.id === props.activeSessionId }"
      >
        <button class="session-list__item-main" @click="onSelect(item.id)">
          <input
            v-if="editingId === item.id"
            v-model="editingTitle"
            class="session-list__rename-input"
            maxlength="20"
            @click.stop
            @blur="saveRename(item.id)"
            @keydown="handleRenameKeydown($event, item.id)"
          />
          <!-- input中，click.stop是为了阻止冒泡;@keydown里面$event是当前这次事件产生的事件对象 -->
          <!-- 如果只写@keydown="handleRenameKeydown，不写后面的$event,那就只能拿到默认的event，拿不到后面的id -->
          <!-- 这种写法是为了拿到事件event和其他参数（这里是item.id） -->
          <span v-else class="session-list__title">{{ item.title }}</span>
        </button>

        <div class="session-list__actions">
          <button
            class="session-list__action-btn session-list__rename-btn"
            @click.stop="editingId === item.id ? saveRename(item.id) : startRename(item)"
          >
            {{ editingId === item.id ? '保存' : '重命名' }}
          </button>
          <button
            class="session-list__action-btn session-list__close-btn"
            @click.stop="delSession(item.id)"
          >
            x
          </button>
        </div>
      </div>
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 8px;
  color: #334155;
}
.session-list__item:hover {
  background: #f8fafc;
}
.session-list__item.is-active {
  border-color: #22c55e;
  color: #166534;
  background: #f0fdf4;
}
.session-list__item-main {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
  padding: 10px 12px;
  cursor: pointer;
}
.session-list__title {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.session-list__rename-input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 8px;
  font: inherit;
}
.session-list__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 10px;
}
.session-list__action-btn {
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: #475569;
  cursor: pointer;
}
.session-list__rename-btn {
  min-width: 44px;
}
.session-list__close-btn {
  border: 1px solid #ef4444;
  border-radius: 6px;
  color: #ef4444;
}
</style>
