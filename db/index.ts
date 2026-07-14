import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

const globalForDb = globalThis as unknown as {
  pool: mysql.Pool | undefined
}

function createPool() {
  const url = process.env.DATABASE_URL
  if (!url) return null

  return mysql.createPool(url)
}

export const pool = globalForDb.pool ?? createPool()

if (process.env.NODE_ENV !== 'production' && pool) {
  globalForDb.pool = pool
}

export const db = pool ? drizzle(pool, { schema, mode: 'default' }) : null

export function requireDb() {
  if (!db) {
    throw new Error('DATABASE_URL is not configured')
  }
  return db
}
