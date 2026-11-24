import { readFileSync, existsSync } from 'node:fs'
import mysql from 'mysql2/promise'

if (existsSync('.env')) process.loadEnvFile('.env')
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
const connection = await mysql.createConnection(process.env.DATABASE_URL)
try {
  await connection.query(readFileSync(new URL('../db/migrations/20261124_pack_open_limits.sql', import.meta.url), 'utf8'))
  console.log('Pack-opening limit table is ready. No collection or account data was changed.')
} finally {
  await connection.end()
}
