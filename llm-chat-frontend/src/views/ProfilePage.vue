<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { resizeAvatar } from '@/utils/image'

const authStore = useAuthStore()
const router = useRouter()

const account = ref(authStore.user?.account || '')
const username = ref(authStore.user?.username || '')
const avatar = ref(authStore.user?.avatar || '')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const profileMessage = ref('')
const passwordMessage = ref('')
const profileError = ref('')
const passwordError = ref('')

const previewAvatar = computed(() => avatar.value)

async function onAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  try {
    avatar.value = await resizeAvatar(file)
    profileError.value = ''
  } catch (error) {
    profileError.value = error instanceof Error ? error.message : '头像处理失败'
  } finally {
    input.value = ''
  }
}

async function onSaveProfile() {
  profileMessage.value = ''
  profileError.value = ''

  try {
    await authStore.saveProfile(username.value, avatar.value)
    profileMessage.value = '个人资料保存成功'
  } catch (error) {
    profileError.value = error instanceof Error ? error.message : '个人资料保存失败'
  }
}

async function onSavePassword() {
  passwordMessage.value = ''
  passwordError.value = ''

  try {
    await authStore.savePassword(currentPassword.value, newPassword.value, confirmPassword.value)
    passwordMessage.value = '密码修改成功'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    passwordError.value = error instanceof Error ? error.message : '密码修改失败'
  }
}

function backToChat() {
  router.push('/')
}
</script>

<template>
  <div class="profile-page">
    <div class="profile-page__card">
      <div class="profile-page__header">
        <div>
          <h1 class="profile-page__title">个人中心</h1>
          <p class="profile-page__desc">支持修改头像、用户名和密码</p>
        </div>
        <button class="profile-page__back-btn" @click="backToChat">返回聊天</button>
      </div>

      <section class="profile-page__section">
        <h2 class="profile-page__section-title">基础资料</h2>
        <div class="profile-page__avatar-row">
          <img
            v-if="previewAvatar"
            :src="previewAvatar"
            alt="头像预览"
            class="profile-page__avatar"
          />
          <div v-else class="profile-page__avatar profile-page__avatar--placeholder">
            {{ username.slice(0, 1).toUpperCase() || 'U' }}
          </div>
          <label class="profile-page__upload-btn">
            上传头像
            <input
              class="profile-page__upload-input"
              type="file"
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              @change="onAvatarChange"
            />
          </label>
        </div>

        <input
          v-model="account"
          class="profile-page__input profile-page__input--readonly"
          type="text"
          placeholder="账号"
          readonly
        />

        <input
          v-model="username"
          class="profile-page__input"
          type="text"
          placeholder="请输入用户名，不能为空"
        />

        <p v-if="profileMessage" class="profile-page__success">{{ profileMessage }}</p>
        <p v-if="profileError" class="profile-page__error">{{ profileError }}</p>

        <button
          class="profile-page__submit-btn"
          :disabled="authStore.loading"
          @click="onSaveProfile"
        >
          {{ authStore.loading ? '保存中...' : '保存资料' }}
        </button>
      </section>

      <section class="profile-page__section">
        <h2 class="profile-page__section-title">修改密码</h2>
        <input
          v-model="currentPassword"
          class="profile-page__input"
          type="password"
          placeholder="请输入当前密码"
        />
        <input
          v-model="newPassword"
          class="profile-page__input"
          type="password"
          placeholder="请输入新密码"
        />
        <input
          v-model="confirmPassword"
          class="profile-page__input"
          type="password"
          placeholder="请再次输入新密码"
        />

        <p v-if="passwordMessage" class="profile-page__success">{{ passwordMessage }}</p>
        <p v-if="passwordError" class="profile-page__error">{{ passwordError }}</p>

        <button
          class="profile-page__submit-btn profile-page__submit-btn--dark"
          :disabled="authStore.loading"
          @click="onSavePassword"
        >
          {{ authStore.loading ? '提交中...' : '修改密码' }}
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100%;
  padding: 32px 20px;
  background: linear-gradient(180deg, var(--app-surface-soft) 0%, var(--app-bg) 100%);
}

.profile-page__card {
  max-width: 760px;
  margin: 0 auto;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 22px;
  padding: 28px;
  box-shadow: var(--app-shadow);
}

.profile-page__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 28px;
}

.profile-page__title {
  margin: 0 0 8px;
  font-size: 28px;
  color: var(--app-text-primary);
}

.profile-page__desc {
  margin: 0;
  color: var(--app-text-secondary);
}

.profile-page__back-btn {
  border: 1px solid var(--app-border);
  background: var(--app-primary-soft);
  color: var(--app-primary);
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
}

.profile-page__section {
  border-top: 1px solid var(--app-border);
  padding-top: 24px;
  margin-top: 24px;
}

.profile-page__section:first-of-type {
  border-top: none;
  padding-top: 0;
  margin-top: 0;
}

.profile-page__section-title {
  margin: 0 0 16px;
  color: var(--app-text-primary);
  font-size: 18px;
}

.profile-page__avatar-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.profile-page__avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--app-border);
}

.profile-page__avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-primary-soft);
  color: var(--app-primary);
  font-weight: 700;
  font-size: 28px;
}

.profile-page__upload-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--app-border-strong);
  background: var(--app-surface);
  color: var(--app-text-primary);
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  overflow: hidden;
}

.profile-page__upload-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.profile-page__input {
  width: 100%;
  border: 1px solid var(--app-border-strong);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--app-text-primary);
  background: var(--app-surface);
}

.profile-page__input--readonly {
  background: var(--app-surface-soft);
  color: var(--app-text-secondary);
}

.profile-page__submit-btn {
  border: none;
  background: var(--app-primary);
  color: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
}

.profile-page__submit-btn--dark {
  background: var(--app-text-primary);
}

.profile-page__submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.profile-page__success {
  margin: 0 0 12px;
  color: var(--app-success);
}

.profile-page__error {
  margin: 0 0 12px;
  color: var(--app-danger);
}
</style>
