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
    <div class="auth-shell">
      <section class="auth-panel auth-panel--intro">
        <span class="auth-panel__badge">LLM Chat Suite</span>
        <h1 class="auth-panel__title">让对话、提示词和状态同步都更顺手</h1>
        <p class="auth-panel__desc">
          一个面向日常工作的对话平台，支持多会话管理、模型切换、个人资料维护以及云端状态保存。
        </p>

        <div class="auth-panel__feature-list">
          <div class="auth-panel__feature">多会话历史自动保留</div>
          <div class="auth-panel__feature">Markdown 与代码高亮</div>
          <div class="auth-panel__feature">桌面 / 移动端统一体验</div>
        </div>
      </section>

      <form class="auth-card" @submit.prevent="onSubmit">
        <h2 class="auth-card__title">登录 LLM 对话平台</h2>
        <p class="auth-card__desc">登录后即可继续查看历史会话并开始新对话。</p>

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
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-shell {
  width: min(1100px, 100%);
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 20px;
}

.auth-panel,
.auth-card {
  border: 1px solid var(--app-border);
  background: var(--app-surface-elevated);
  box-shadow: var(--app-shadow);
  backdrop-filter: var(--app-backdrop-blur);
}

.auth-panel {
  border-radius: 34px;
  padding: 36px;
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.18), transparent 24%),
    radial-gradient(circle at bottom right, rgba(249, 115, 22, 0.12), transparent 20%),
    var(--app-surface-elevated);
}

.auth-panel__badge {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.12);
  color: var(--app-primary);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-panel__title {
  margin: 20px 0 12px;
  font-size: clamp(34px, 4vw, 54px);
  line-height: 1;
  font-family: var(--app-display-font);
  color: var(--app-text-primary);
}

.auth-panel__desc {
  margin: 0;
  max-width: 520px;
  color: var(--app-text-secondary);
  line-height: 1.8;
}

.auth-panel__feature-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 28px;
}

.auth-panel__feature {
  min-height: 108px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: rgba(255, 255, 255, 0.52);
  color: var(--app-text-primary);
  line-height: 1.6;
}

.auth-card {
  border-radius: 30px;
  padding: 32px;
}

.auth-card__title {
  margin: 0 0 8px;
  font-size: 28px;
  color: var(--app-text-primary);
}

.auth-card__desc {
  margin: 0 0 22px;
  color: var(--app-text-secondary);
  line-height: 1.7;
}

.auth-input {
  width: 100%;
  margin-bottom: 12px;
  border: 1px solid var(--app-border-strong);
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 14px;
  color: var(--app-text-primary);
  background: rgba(255, 255, 255, 0.68);
}

.auth-button {
  width: 100%;
  border: none;
  border-radius: 16px;
  padding: 14px 16px;
  background: var(--app-primary);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 18px 28px rgba(15, 118, 110, 0.18);
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

@media (max-width: 900px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-panel__feature-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .auth-page {
    padding: 14px;
  }

  .auth-panel,
  .auth-card {
    border-radius: 22px;
    padding: 22px 18px;
  }

  .auth-card__title {
    font-size: 24px;
  }
}
</style>
