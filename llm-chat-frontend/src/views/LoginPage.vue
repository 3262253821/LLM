<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const account = ref('')
const password = ref('')
const errorText = ref('')

async function onSubmit() {
  errorText.value = ''

  try {
    await authStore.login(account.value, password.value)
    await router.push('/')
  } catch (error) {
    errorText.value = error instanceof Error ? error.message : '登录失败'
  }
}
</script>

<template>
  <div class="auth-page">
    <form class="auth-card" @submit.prevent="onSubmit">
      <h1 class="auth-card__title">登录 LLM 对话平台</h1>
      <p class="auth-card__desc">登录后才可以使用聊天功能</p>
      <input v-model="account" class="auth-input" type="text" placeholder="请输入账号" />
      <input v-model="password" class="auth-input" type="password" placeholder="请输入密码" />
      <p v-if="errorText" class="auth-error">{{ errorText }}</p>
      <button class="auth-button" type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? '登录中...' : '登录' }}
      </button>
      <p class="auth-link-text">
        还没有账号？
        <RouterLink to="/register">去注册</RouterLink>
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
