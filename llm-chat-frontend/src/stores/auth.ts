import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchCurrentUser,
  loginUser,
  registerUser,
  updatePassword,
  updateProfile,
} from '@/services/authApi'
import { clearAuthState, loadAuthState, saveAuthState } from '@/utils/authStorage'
import type { AuthUser } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const inited = ref(false)

  const isLoggedIn = computed(() => Boolean(token.value && user.value))

  function persist() {
    saveAuthState({
      token: token.value,
      user: user.value,
    })
  }

  function clearAuth() {
    token.value = ''
    user.value = null
    clearAuthState()
  }

  async function init() {
    if (inited.value) return

    const savedState = loadAuthState()

    if (savedState?.token) {
      token.value = savedState.token
      user.value = savedState.user

      try {
        user.value = await fetchCurrentUser(savedState.token)
        persist()
      } catch {
        clearAuth()
      }
    }

    inited.value = true
  }

  async function login(account: string, password: string) {
    loading.value = true

    try {
      const data = await loginUser(account, password)
      token.value = data.token
      user.value = data.user
      persist()
    } finally {
      loading.value = false
    }
  }

  async function register(account: string, username: string, password: string) {
    loading.value = true

    try {
      const data = await registerUser(account, username, password)
      token.value = data.token
      user.value = data.user
      persist()
    } finally {
      loading.value = false
    }
  }

  function logout() {
    clearAuth()
  }

  async function saveProfile(username: string, avatar: string) {
    if (!token.value) {
      throw new Error('当前未登录')
    }

    loading.value = true

    try {
      const data = await updateProfile(token.value, username, avatar)
      token.value = data.token
      user.value = data.user
      persist()
    } finally {
      loading.value = false
    }
  }

  async function savePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    if (!token.value) {
      throw new Error('当前未登录')
    }

    loading.value = true

    try {
      await updatePassword(token.value, currentPassword, newPassword, confirmPassword)
    } finally {
      loading.value = false
    }
  }

  return {
    token,
    user,
    loading,
    isLoggedIn,
    init,
    login,
    register,
    logout,
    saveProfile,
    savePassword,
  }
})
