<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const account = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorText = ref('')

async function onSubmit() {
  errorText.value = ''

  if (password.value !== confirmPassword.value) {
    errorText.value = '两次输入的密码不一致'
    return
  }

  try {
    await authStore.register(account.value, username.value, password.value)
    await router.push('/')
  } catch (error) {
    errorText.value = error instanceof Error ? error.message : '注册失败'
  }
}
</script>

<template>
  <div class="auth-page">
    <form class="auth-card" @submit.prevent="onSubmit">
      <h1 class="auth-card__title">注册账号</h1>
      <p class="auth-card__desc">注册后即可进入对话平台</p>
      <input
        v-model="account"
        class="auth-input"
        type="text"
        placeholder="账号 4 到 20 位，字母数字下划线"
      />
      <input v-model="username" class="auth-input" type="text" placeholder="用户名不能为空，支持中文展示" />
      <input v-model="password" class="auth-input" type="password" placeholder="密码至少 6 位" />
      <input
        v-model="confirmPassword"
        class="auth-input"
        type="password"
        placeholder="请再次输入密码"
      />
      <p v-if="errorText" class="auth-error">{{ errorText }}</p>
      <button class="auth-button" type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? '注册中...' : '注册' }}
      </button>
      <p class="auth-link-text">
        已有账号？ <RouterLink to="/login">去登录</RouterLink>
      </p>
    </form>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, var(--app-surface-soft) 0%, var(--app-bg) 100%);
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 18px;
  padding: 28px;
  box-shadow: var(--app-shadow);
}

.auth-card__title {
  margin: 0 0 8px;
  font-size: 24px;
  color: var(--app-text-primary);
}

.auth-card__desc {
  margin: 0 0 20px;
  color: var(--app-text-secondary);
  font-size: 14px;
}

.auth-input {
  width: 100%;
  margin-bottom: 12px;
  border: 1px solid var(--app-border-strong);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 14px;
  color: var(--app-text-primary);
  background: var(--app-surface);
}

.auth-button {
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 12px 14px;
  background: var(--app-primary);
  color: #fff;
  cursor: pointer;
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-error {
  margin: 0 0 12px;
  color: var(--app-danger);
  font-size: 14px;
}

.auth-link-text {
  margin: 14px 0 0;
  font-size: 14px;
  color: var(--app-text-secondary);
}
</style>
