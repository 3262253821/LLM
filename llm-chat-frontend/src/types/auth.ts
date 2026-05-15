export interface AuthUser {
  id: string
  account: string
  username: string
  avatar?: string
}

export interface AuthPersistedState {
  token: string
  user: AuthUser | null
}
