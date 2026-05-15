import type { RowDataPacket } from 'mysql2'
import { pool } from '../db.js'
import type { PersistedChatState } from '../types.js'

interface ChatStateRow extends RowDataPacket {
  user_id: string
  state_json: string
  updated_at: Date | string
}

export async function findChatStateByUserId(userId: string) {
  const [rows] = await pool.query<ChatStateRow[]>(
    'SELECT user_id, state_json, updated_at FROM chat_states WHERE user_id = ?',
    [userId],
  )

  if (!rows[0]) {
    return null
  }

  return JSON.parse(rows[0].state_json) as PersistedChatState
}

export async function saveChatStateByUserId(userId: string, state: PersistedChatState) {
  await pool.execute(
    `
      INSERT INTO chat_states (user_id, state_json)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        state_json = VALUES(state_json),
        updated_at = CURRENT_TIMESTAMP
    `,
    [userId, JSON.stringify(state)],
  )
}
