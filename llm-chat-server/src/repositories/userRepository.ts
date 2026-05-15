import type { RowDataPacket } from 'mysql2'
import { pool } from '../db.js'
import type { UserRecord } from '../types.js'

interface UserRow extends RowDataPacket {
  id: string
  account: string
  username: string
  password_hash: string
  avatar: string | null
  created_at: Date | string
}

function mapUserRow(row: UserRow): UserRecord {
  return {
    id: row.id,
    account: row.account,
    username: row.username,
    passwordHash: row.password_hash,
    avatar: row.avatar || '',
    createdAt:
      row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  }
}

export async function findUserById(id: string) {
  const [rows] = await pool.query<UserRow[]>('SELECT * FROM users WHERE id = ?', [id])
  return rows[0] ? mapUserRow(rows[0]) : null
}

export async function findUserByAccount(account: string) {
  const [rows] = await pool.query<UserRow[]>('SELECT * FROM users WHERE account = ?', [account])
  return rows[0] ? mapUserRow(rows[0]) : null
}

export async function findUserByUsername(username: string) {
  const [rows] = await pool.query<UserRow[]>('SELECT * FROM users WHERE username = ?', [username])
  return rows[0] ? mapUserRow(rows[0]) : null
}

export async function createUser(user: UserRecord) {
  await pool.execute(
    `
      INSERT INTO users (id, account, username, password_hash, avatar, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [user.id, user.account, user.username, user.passwordHash, user.avatar || '', user.createdAt],
  )
}

export async function updateUserProfile(id: string, username: string, avatar: string) {
  await pool.execute('UPDATE users SET username = ?, avatar = ? WHERE id = ?', [
    username,
    avatar,
    id,
  ])
}

export async function updateUserPassword(id: string, passwordHash: string) {
  await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id])
}
