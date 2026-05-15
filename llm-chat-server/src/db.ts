import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`缺少 ${name} 配置`)
  }

  return value
}

export const pool = mysql.createPool({
  host: getRequiredEnv('MYSQL_HOST'),
  port: Number(process.env.MYSQL_PORT || 3306),
  user: getRequiredEnv('MYSQL_USER'),
  password: getRequiredEnv('MYSQL_PASSWORD'),
  database: getRequiredEnv('MYSQL_DATABASE'),
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
})
