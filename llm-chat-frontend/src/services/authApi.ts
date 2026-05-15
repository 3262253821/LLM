import type { AuthUser } from '@/types/auth'
import { request } from '@/utils/request'

interface AuthResponse {
  token: string
  user: AuthUser
}

interface UpdatePasswordResponse {
  message: string
}

export async function registerUser(account: string, username: string, password: string) {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: {
      account,
      username,
      password,
    },
  })
}

export async function loginUser(account: string, password: string) {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { account, password },
  })
}

export async function fetchCurrentUser(token: string) {
  const data = await request<{ user: AuthUser }>('/api/auth/me', {
    token,
  })
  return data.user
}

export async function updateProfile(token: string, username: string, avatar: string) {
  return request<AuthResponse>('/api/auth/profile', {
    method: 'PUT',
    token,
    body: { username, avatar },
  })
}

export async function updatePassword(
  token: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) {
  return request<UpdatePasswordResponse>('/api/auth/password', {
    method: 'PUT',
    token,
    body: { currentPassword, newPassword, confirmPassword },
  })
}
