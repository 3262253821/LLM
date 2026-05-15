<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const userName = computed(() => authStore.user?.username || '未登录用户')
const avatar = computed(() => authStore.user?.avatar || '')

function toggleMenu() {
  open.value = !open.value
}

function goProfile() {
  open.value = false
  router.push('/profile')
}

function logout() {
  open.value = false
  authStore.logout()
  router.push('/login')
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node | null

  if (rootRef.value && target && !rootRef.value.contains(target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="rootRef" class="user-menu-card">
    <button class="user-menu-card__trigger" @click="toggleMenu">
      <img v-if="avatar" :src="avatar" alt="用户头像" class="user-menu-card__avatar" />
      <div v-else class="user-menu-card__avatar user-menu-card__avatar--placeholder">
        {{ userName.slice(0, 1).toUpperCase() }}
      </div>
      <div class="user-menu-card__meta">
        <span class="user-menu-card__name">{{ userName }}</span>
        <span class="user-menu-card__hint">账号中心</span>
      </div>
    </button>

    <div v-if="open" class="user-menu-card__dropdown">
      <button class="user-menu-card__menu-item" @click="goProfile">个人中心</button>
      <button class="user-menu-card__menu-item user-menu-card__menu-item--danger" @click="logout">
        退出登录
      </button>
    </div>
  </div>
</template>

<style scoped>
.user-menu-card {
  position: relative;
}

.user-menu-card__trigger {
  width: 100%;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
}

.user-menu-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--app-border);
}

.user-menu-card__avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-primary);
  font-weight: 700;
  background: var(--app-primary-soft);
}

.user-menu-card__meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-menu-card__name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--app-text-primary);
  font-size: 14px;
}

.user-menu-card__hint {
  margin-top: 2px;
  font-size: 12px;
  color: var(--app-text-secondary);
}

.user-menu-card__dropdown {
  position: absolute;
  left: 0;
  bottom: calc(100% + 8px);
  width: 100%;
  border: 1px solid var(--app-border);
  border-radius: 14px;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-menu-card__menu-item {
  border: none;
  background: var(--app-surface);
  text-align: left;
  border-radius: 10px;
  padding: 10px 12px;
  color: var(--app-text-primary);
  cursor: pointer;
}

.user-menu-card__menu-item:hover {
  background: var(--app-surface-soft);
}

.user-menu-card__menu-item--danger {
  color: var(--app-danger);
}
</style>
