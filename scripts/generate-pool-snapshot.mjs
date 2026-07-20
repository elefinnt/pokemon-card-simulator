// Regenerate the committed card-pool snapshot used to make the first open of a
// set instant (see lib/pokemontcg/snapshot.ts).
//
// Usage: pnpm snapshot
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

async function fetchPage(setId, page, headers) {
  const url = new URL(`${API_BASE}/cards`)
  url.searchParams.set('q', `set.id:${setId}`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('pageSize', String(PAGE_SIZE))
  url.searchParams.set('orderBy', 'number')
  url.searchParams.set('select', POOL_FIELDS)

  const res = await fetch(url, { headers })
  if (!res.ok) {
    throw new Error(`API responded with ${res.status} for ${setId} page ${page}`)
  }
  return res.json()
}

async function fetchSet(setId, headers) {
  const first = await fetchPage(setId, 1, headers)
  const cards = [...first.data]
  const pageCount = Math.ceil(first.totalCount / (first.pageSize || PAGE_SIZE))
  for (let page = 2; page <= pageCount; page++) {
    const res = await fetchPage(setId, page, headers)
    cards.push(...res.data)
  }
  return cards
}

async function main() {
  const key = loadApiKey()
  const headers = authHeaders(key)
  console.log(key ? 'Using API key.' : 'No API key found — using anonymous rate limit.')

  const ids = await readCuratedIds()
  console.log(`Snapshotting ${ids.length} sets…`)

  const sets = {}
  for (const id of ids) {
    process.stdout.write(`  ${id}… `)
    try {
      const cards = await fetchSet(id, headers)
      sets[id] = cards
      console.log(`${cards.length} cards`)
    } catch (err) {
      console.log(`FAILED (${err instanceof Error ? err.message : err})`)
    }
  }

  const payload = { generatedAt: new Date().toISOString(), sets }
  await writeFile(OUT_PATH, `${JSON.stringify(payload)}\n`)
  console.log(`\nWrote ${OUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
