import { useAuthStore } from '@/stores/auth'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: RequestMethod
  body?: Record<string, unknown>
  headers?: Record<string, string>
  token?: string
  auth?: boolean
  signal?: AbortSignal
}

interface ErrorResponse {
  error?: {
    message?: string
  }
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return typeof value === 'object' && value !== null && 'error' in value
}

const baseUrl = import.meta.env.VITE_API_BASE_URL

function resolveToken(options: RequestOptions) {
  if (options.token) {
    return options.token
  }

  if (options.auth) {
    const authStore = useAuthStore()
    return authStore.token
  }

  return ''
}

export async function request<T>(path: string, options: RequestOptions = {}) {
  if (!baseUrl) {
    throw new Error('缺少 VITE_API_BASE_URL 配置')
  }

  const token = resolveToken(options)
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...options.headers,
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    ...(options.signal ? { signal: options.signal } : {}),
  })

  const data = (await response.json().catch(() => null)) as T | ErrorResponse | null

  if (!response.ok) {
    throw new Error(isErrorResponse(data) ? data.error?.message || '请求失败' : '请求失败')
  }

  return data as T
}
