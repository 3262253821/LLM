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
    <div class="profile-page__shell">
      <section class="profile-page__hero">
        <span class="profile-page__badge">Account Center</span>
        <h1 class="profile-page__title">个人中心</h1>
        <p class="profile-page__desc">维护你的头像、用户名和登录安全设置。</p>

        <div class="profile-page__hero-card">
          <img v-if="previewAvatar" :src="previewAvatar" alt="头像预览" class="profile-page__hero-avatar" />
          <div v-else class="profile-page__hero-avatar profile-page__hero-avatar--placeholder">
            {{ username.slice(0, 1).toUpperCase() || 'U' }}
          </div>

          <div>
            <div class="profile-page__hero-name">{{ username || '未设置用户名' }}</div>
            <div class="profile-page__hero-account">@{{ account || 'account' }}</div>
          </div>
        </div>

        <button class="profile-page__back-btn" type="button" @click="backToChat">返回聊天</button>
      </section>

      <div class="profile-page__content">
        <section class="profile-page__section">
          <h2 class="profile-page__section-title">基础资料</h2>
          <p class="profile-page__section-desc">上传头像并更新对外展示的用户名。</p>

          <div class="profile-page__avatar-row">
            <img v-if="previewAvatar" :src="previewAvatar" alt="头像预览" class="profile-page__avatar" />
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

          <button class="profile-page__submit-btn" :disabled="authStore.loading" @click="onSaveProfile">
            {{ authStore.loading ? '保存中...' : '保存资料' }}
          </button>
        </section>

        <section class="profile-page__section">
          <h2 class="profile-page__section-title">安全设置</h2>
          <p class="profile-page__section-desc">定期更新密码，保障账号使用安全。</p>

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
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100dvh;
  padding: 24px;
}

.profile-page__shell {
  width: min(1200px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 0.88fr 1.12fr;
  gap: 20px;
}

.profile-page__hero,
.profile-page__section {
  border: 1px solid var(--app-border);
  background: var(--app-surface-elevated);
  box-shadow: var(--app-shadow);
  backdrop-filter: var(--app-backdrop-blur);
}

.profile-page__hero {
  border-radius: 34px;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.18), transparent 24%),
    radial-gradient(circle at bottom right, rgba(96, 165, 250, 0.14), transparent 20%),
    var(--app-surface-elevated);
}

.profile-page__badge {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.12);
  color: var(--app-primary);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.profile-page__title {
  margin: 18px 0 10px;
  font-size: 46px;
  line-height: 1;
  color: var(--app-text-primary);
  font-family: var(--app-display-font);
}

.profile-page__desc {
  margin: 0;
  color: var(--app-text-secondary);
  line-height: 1.8;
}

.profile-page__hero-card {
  margin-top: 28px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border-radius: 24px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: rgba(255, 255, 255, 0.56);
}

.profile-page__hero-avatar {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--app-border);
}

.profile-page__hero-avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-primary);
  background: var(--app-primary-soft);
  font-size: 28px;
  font-weight: 700;
}

.profile-page__hero-name {
  font-size: 22px;
  color: var(--app-text-primary);
}

.profile-page__hero-account {
  margin-top: 6px;
  color: var(--app-text-secondary);
}

.profile-page__back-btn {
  margin-top: 20px;
  border: 1px solid var(--app-border);
  background: rgba(255, 255, 255, 0.68);
  color: var(--app-text-primary);
  border-radius: 16px;
  padding: 12px 16px;
  cursor: pointer;
}

.profile-page__content {
  display: grid;
  gap: 20px;
}

.profile-page__section {
  border-radius: 30px;
  padding: 28px;
}

.profile-page__section-title {
  margin: 0;
  color: var(--app-text-primary);
  font-size: 22px;
}

.profile-page__section-desc {
  margin: 8px 0 18px;
  color: var(--app-text-secondary);
  line-height: 1.7;
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
  background: rgba(255, 255, 255, 0.68);
  color: var(--app-text-primary);
  border-radius: 14px;
  padding: 12px 14px;
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
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--app-text-primary);
  background: rgba(255, 255, 255, 0.68);
}

.profile-page__input--readonly {
  background: var(--app-surface-soft);
  color: var(--app-text-secondary);
}

.profile-page__submit-btn {
  border: none;
  background: var(--app-primary);
  color: #fff;
  border-radius: 16px;
  padding: 14px 18px;
  cursor: pointer;
  box-shadow: 0 18px 28px rgba(15, 118, 110, 0.18);
}

.profile-page__submit-btn--dark {
  background: var(--app-text-primary);
  box-shadow: none;
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

@media (max-width: 960px) {
  .profile-page__shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-page {
    padding: 12px;
  }

  .profile-page__hero,
  .profile-page__section {
    border-radius: 22px;
    padding: 20px 16px;
  }

  .profile-page__title {
    font-size: 34px;
  }

  .profile-page__hero-card,
  .profile-page__avatar-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-page__upload-btn,
  .profile-page__submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
