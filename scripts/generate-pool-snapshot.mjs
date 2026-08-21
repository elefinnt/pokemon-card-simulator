// Regenerate the committed card-pool snapshot used to make the first open of a
// set instant (see lib/pokemontcg/snapshot.ts).
//
// Usage:
//   pnpm snapshot
//   SNAPSHOT_SET=me2pt5 pnpm snapshot   (PowerShell: $env:SNAPSHOT_SET='me2pt5'; pnpm snapshot)
//
// Reads POKEMONTCG_API_KEY from the environment or .env for the higher rate
// limit. The curated set list is sourced from lib/pack-overrides.ts so there is
// a single source of truth.

import { readFile, writeFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const API_BASE = 'https://api.pokemontcg.io/v2'
const POOL_FIELDS = 'id,name,number,rarity,supertype,subtypes,types,artist,images'
const PAGE_SIZE = 250
const OUT_PATH = join(ROOT, 'lib', 'pokemontcg', 'pool-snapshot.json')

function loadApiKey() {
  if (process.env.POKEMONTCG_API_KEY) return process.env.POKEMONTCG_API_KEY
  const envPath = join(ROOT, '.env')
  if (!existsSync(envPath)) return undefined
  try {
    const text = readFileSync(envPath, 'utf8')
    const match = text.match(/^\s*POKEMONTCG_API_KEY\s*=\s*(.+)\s*$/m)
    if (!match) return undefined
    return match[1].trim().replace(/^["']|["']$/g, '')
  } catch {
    return undefined
  }
}

function authHeaders(key) {
  return key && key !== 'your_key_here' ? { 'X-Api-Key': key } : {}
}

async function readCuratedIds() {
  const text = await readFile(
    join(ROOT, 'lib', 'pack-overrides.ts'),
    'utf8',
  )
  const block = text.match(/CURATED_SET_IDS\s*=\s*\[([\s\S]*?)\]/)
  if (!block) throw new Error('Could not find CURATED_SET_IDS in pack-overrides.ts')
  return [...block[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1])
}

const MAX_ATTEMPTS = 5

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// The API regularly throws transient 5xx errors, so retry with backoff.
async function fetchPage(setId, page, headers, orderBy = 'number') {
  const url = new URL(`${API_BASE}/cards`)
  url.searchParams.set('q', `set.id:${setId}`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('pageSize', String(PAGE_SIZE))
  url.searchParams.set('orderBy', orderBy)
  url.searchParams.set('select', POOL_FIELDS)

  let lastError
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { headers })
      if (res.ok) return res.json()
      lastError = new Error(
        `API responded with ${res.status} for ${setId} page ${page}`,
      )
      if (res.status < 500 && res.status !== 429) break
    } catch (err) {
      lastError = err
    }
    if (attempt < MAX_ATTEMPTS) await sleep(1500 * attempt)
  }
  throw lastError
}

function mergeCardsById(pages) {
  const byId = new Map()
  for (const page of pages) {
    for (const card of page) {
      if (!byId.has(card.id)) byId.set(card.id, card)
    }
  }
  return [...byId.values()]
}

async function fetchSet(setId, headers) {
  const first = await fetchPage(setId, 1, headers)
  const pages = [first.data]
  const pageCount = Math.ceil(first.totalCount / (first.pageSize || PAGE_SIZE))
  for (let page = 2; page <= pageCount; page++) {
    const res = await fetchPage(setId, page, headers)
    pages.push(res.data)
  }
  let cards = mergeCardsById(pages)
  if (first.totalCount > 0 && cards.length < first.totalCount) {
    const tail = await fetchPage(setId, 1, headers, '-number')
    cards = mergeCardsById([cards, tail.data])
  }
  if (first.totalCount > 0 && cards.length < first.totalCount) {
    throw new Error(
      `incomplete pool for ${setId}: got ${cards.length} of ${first.totalCount}`,
    )
  }
  return cards
}

async function main() {
  const key = loadApiKey()
  const headers = authHeaders(key)
  console.log(key ? 'Using API key.' : 'No API key found — using anonymous rate limit.')

  const onlyId = process.env.SNAPSHOT_SET
  const ids = onlyId ? [onlyId] : await readCuratedIds()
  console.log(
    onlyId
      ? `Snapshotting ${onlyId}…`
      : `Snapshotting ${ids.length} sets…`,
  )

  // Keep previously snapshotted cards for any set the API fails on, so a
  // flaky run never shrinks the committed snapshot. A single-set run starts
  // from that snapshot so other sets are left untouched.
  let previous = {}
  if (existsSync(OUT_PATH)) {
    try {
      previous = JSON.parse(readFileSync(OUT_PATH, 'utf8')).sets ?? {}
    } catch {
      previous = {}
    }
  }

  const sets = onlyId ? { ...previous } : {}
  let failures = 0
  for (const id of ids) {
    process.stdout.write(`  ${id}… `)
    try {
      const cards = await fetchSet(id, headers)
      sets[id] = cards
      console.log(`${cards.length} cards`)
    } catch (err) {
      failures++
      if (previous[id]?.length) {
        sets[id] = previous[id]
        console.log(
          `FAILED, kept ${previous[id].length} cards from previous snapshot (${err instanceof Error ? err.message : err})`,
        )
      } else {
        console.log(`FAILED (${err instanceof Error ? err.message : err})`)
      }
    }
  }

  const payload = { generatedAt: new Date().toISOString(), sets }
  await writeFile(OUT_PATH, `${JSON.stringify(payload)}\n`)
  console.log(`\nWrote ${OUT_PATH}`)
  if (failures > 0) {
    console.log(`${failures} set(s) failed — rerun \`pnpm snapshot\` to fill gaps.`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
