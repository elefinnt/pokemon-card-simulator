const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

test('MySQL saves duplicates atomically and resets shared limit buckets', { skip: process.env.RUN_MYSQL_TESTS !== '1' }, async () => {
  if (fs.existsSync('.env')) process.loadEnvFile('.env')
  const mysql = require('mysql2/promise')
  const { drizzle } = require('drizzle-orm/mysql2')
  const dbModule = require('../db/index.ts')
  const connection = await mysql.createConnection(process.env.DATABASE_URL)
  const originalRequireDb = dbModule.requireDb
  try {
    // Connection-local temporary tables shadow real names. Production rows,
    // tables and schema are never written; closing the connection removes them.
    await connection.query(`CREATE TEMPORARY TABLE collected_cards (
      id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), card_id VARCHAR(255), set_id VARCHAR(255),
      name VARCHAR(255), number VARCHAR(64), rarity VARCHAR(128), tier VARCHAR(32), foil BOOLEAN, rainbow BOOLEAN,
      image_small TEXT, image_large TEXT, count INT NOT NULL, first_pulled_at DATETIME(3), last_pulled_at DATETIME(3),
      UNIQUE KEY user_card (user_id, card_id))`)
    await connection.query(`CREATE TEMPORARY TABLE set_progress (
      id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), set_id VARCHAR(255), pool_total INT, packs_opened INT,
      UNIQUE KEY user_set (user_id, set_id))`)
    await connection.query(`CREATE TEMPORARY TABLE user_stats (
      id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), total_packs_opened INT, total_cards_pulled INT,
      UNIQUE KEY user_stats_user (user_id))`)
    const orm = drizzle(connection)
    // Expose only transactions: a regression to reading the whole binder would
    // fail here rather than adding a hidden expensive SELECT to every opening.
    dbModule.requireDb = () => ({ transaction: orm.transaction.bind(orm) })
    const { recordPackForUser } = require('../lib/collection-db.ts')
    const card = { id: 'sma-SV1', name: 'Scyther', number: 'SV1', rarity: 'Rare Shiny', tier: 'ultra', foil: true, rainbow: true, imageSmall: 'small.png', imageLarge: 'large.png' }
    const pack = { setId: 'sm115', poolTotal: 163, cards: [card, card, card] }
    await recordPackForUser('test-player', pack)
    await recordPackForUser('test-player', pack)
    const [[saved]] = await connection.query('SELECT count, set_id FROM collected_cards')
    assert.equal(saved.count, 6)
    assert.equal(saved.set_id, 'sma')
    const [[progress]] = await connection.query('SELECT pool_total, packs_opened FROM set_progress')
    assert.equal(progress.pool_total, 163)
    assert.equal(progress.packs_opened, 2)
    const [[stats]] = await connection.query('SELECT total_cards_pulled, total_packs_opened FROM user_stats')
    assert.equal(stats.total_cards_pulled, 6)
    assert.equal(stats.total_packs_opened, 2)

    const sql = fs.readFileSync('db/migrations/20261124_pack_open_limits.sql', 'utf8')
    await connection.query(sql.replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMPORARY TABLE'))
    const { takePackOpenToken } = require('../lib/pack-open-limits.ts')
    const now = Date.UTC(2026, 10, 24, 12, 34, 10)
    async function consume(subject, time = now) {
      await connection.beginTransaction()
      try {
        const retry = await takePackOpenToken(connection, subject, { minute: 2, hour: 4 }, time)
        await connection.commit()
        return retry
      } catch (err) { await connection.rollback(); throw err }
    }
    assert.equal(await consume('account-a'), 0)
    assert.equal(await consume('account-a'), 0)
    assert.equal(await consume('account-a'), 50)
    assert.equal(await consume('account-b'), 0, 'Accounts must have independent limits')
    assert.equal(await consume('account-a', now + 60_000), 0, 'Minute should reset')
    assert.equal(await consume('account-a', now + 60_000), 1490, 'Hour limit should survive minute reset')
    assert.equal(await consume('account-a', now + 3_600_000), 0, 'Hour should reset')
  } finally {
    dbModule.requireDb = originalRequireDb
    await connection.end()
    await dbModule.pool?.end()
  }
})
