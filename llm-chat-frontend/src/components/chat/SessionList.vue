<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import UserMenuCard from '@/components/chat/UserMenuCard.vue'
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

const editingId = ref<number | null>(null)
const editingTitle = ref('')
const menuOpenId = ref<number | null>(null)
const pendingDeleteId = ref<number | null>(null)

function onSelect(id: number) {
  if (editingId.value === id) return
  emit('select-session', id)
}

function onCreate() {
  emit('create-session')
}

function startRename(item: SessionItem) {
  editingId.value = item.id
  editingTitle.value = item.title
  menuOpenId.value = null
}

function saveRename(id: number) {
  const title = editingTitle.value.trim() || '未命名会话'
  emit('rename-session', id, title)
  editingId.value = null
  editingTitle.value = ''
}

function cancelRename() {
  editingId.value = null
  editingTitle.value = ''
}

function handleRenameKeydown(event: KeyboardEvent, id: number) {
  if (event.key === 'Enter') {
    event.preventDefault()
    saveRename(id)
  }

  if (event.key === 'Escape') {
    cancelRename()
  }
}

function toggleMenu(id: number) {
  menuOpenId.value = menuOpenId.value === id ? null : id
}

function askDelete(id: number) {
  pendingDeleteId.value = id
  menuOpenId.value = null
}

function confirmDelete() {
  if (pendingDeleteId.value === null) return
  emit('del-session', pendingDeleteId.value)
  pendingDeleteId.value = null
}

function cancelDelete() {
  pendingDeleteId.value = null
}

function handleDocumentClick() {
  menuOpenId.value = null
}

function stopPropagation(event: MouseEvent) {
  event.stopPropagation()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
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
          <span v-else class="session-list__title">{{ item.title }}</span>
        </button>

        <div class="session-list__actions" @click.stop="stopPropagation">
          <button class="session-list__menu-btn" @click="toggleMenu(item.id)">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="12" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19" cy="12" r="1.8" />
            </svg>
          </button>

          <div v-if="menuOpenId === item.id" class="session-list__menu">
            <button class="session-list__menu-item" @click="startRename(item)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M4 19.5V16L14.2 5.8A2.12 2.12 0 0 1 17.2 8.8L7 19H4.5" />
                <path d="M12.5 7.5L16.5 11.5" />
              </svg>
              <span>重命名</span>
            </button>
            <button class="session-list__menu-item session-list__menu-item--danger" @click="askDelete(item.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3 6.5H21" />
                <path d="M8.5 6.5V5A1.5 1.5 0 0 1 10 3.5H14A1.5 1.5 0 0 1 15.5 5V6.5" />
                <path d="M6.5 6.5L7.3 18A2 2 0 0 0 9.29 19.8H14.71A2 2 0 0 0 16.7 18L17.5 6.5" />
                <path d="M10 10V16" />
                <path d="M14 10V16" />
              </svg>
              <span>删除</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="session-list__footer">
      <UserMenuCard />
    </div>

    <div v-if="pendingDeleteId !== null" class="session-list__dialog-mask" @click="cancelDelete">
      <div class="session-list__dialog" @click.stop>
        <h3 class="session-list__dialog-title">删除后，该对话将不可恢复</h3>
        <p class="session-list__dialog-desc">确认后会删除该会话及其聊天记录。</p>
        <div class="session-list__dialog-actions">
          <button class="session-list__dialog-cancel" @click="cancelDelete">取消</button>
          <button class="session-list__dialog-confirm" @click="confirmDelete">删除该对话</button>
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
  position: relative;
}

.session-list__top {
  padding: 12px;
  border-bottom: 1px solid var(--app-border);
}

.session-list__new-btn {
  width: 100%;
  border: 1px dashed var(--app-border-strong);
  background: var(--app-surface);
  color: var(--app-text-primary);
  border-radius: 12px;
  height: 42px;
  cursor: pointer;
}

.session-list__body {
  flex: 1;
  padding: 10px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-list__footer {
  padding: 12px;
  border-top: 1px solid var(--app-border);
}

.session-list__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  border-radius: 14px;
  color: var(--app-text-primary);
}

.session-list__item:hover {
  background: var(--app-surface-soft);
}

.session-list__item.is-active {
  border-color: var(--app-success);
  color: var(--app-success);
  background: var(--app-success-soft);
}

.session-list__item-main {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
  padding: 12px 14px;
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
  border: 1px solid var(--app-border-strong);
  border-radius: 8px;
  padding: 7px 9px;
  font: inherit;
  color: var(--app-text-primary);
  background: var(--app-surface);
}

.session-list__actions {
  position: relative;
  padding-right: 10px;
}

.session-list__menu-btn {
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  background: transparent;
  color: currentColor;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.session-list__menu-btn:hover {
  border-color: var(--app-border);
  background: rgba(255, 255, 255, 0.5);
}

.session-list__menu-btn svg {
  width: 18px;
  height: 18px;
}

.session-list__menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 148px;
  padding: 8px;
  border: 1px solid var(--app-border);
  border-radius: 16px;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
  z-index: 20;
}

.session-list__menu-item {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--app-text-primary);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.session-list__menu-item:hover {
  background: var(--app-surface-soft);
}

.session-list__menu-item svg {
  width: 16px;
  height: 16px;
}

.session-list__menu-item--danger {
  color: #ef4444;
}

.session-list__dialog-mask {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 40;
}

.session-list__dialog {
  width: min(420px, 100%);
  padding: 24px;
  border-radius: 24px;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
}

.session-list__dialog-title {
  margin: 0;
  font-size: 22px;
  color: var(--app-text-primary);
}

.session-list__dialog-desc {
  margin: 14px 0 0;
  color: var(--app-text-secondary);
  line-height: 1.6;
}

.session-list__dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.session-list__dialog-cancel,
.session-list__dialog-confirm {
  border-radius: 999px;
  padding: 10px 18px;
  cursor: pointer;
}

.session-list__dialog-cancel {
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-primary);
}

.session-list__dialog-confirm {
  border: none;
  background: #ef4444;
  color: #fff;
}
</style>
