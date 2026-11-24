const { test } = require('node:test')
const assert = require('node:assert/strict')
const snapshot = require('../lib/pokemontcg/pool-snapshot.json')
const { emptyCollection, summarizeSet } = require('../lib/collection-types.ts')
const { mergePackIntoCollection } = require('../lib/collection-merge.ts')
const { buildShinyVaultCards } = require('../lib/shiny-vault.ts')
const { classifyTier } = require('../lib/pokemontcg/rarity.ts')
const { limitsFor, takePackOpenToken, packOpeningPauseResponse } = require('../lib/pack-open-limits.ts')

function card(raw) {
  return { ...raw, number: raw.number ?? '', rarity: raw.rarity ?? 'Common', tier: classifyTier(raw.rarity ?? 'Common', raw.subtypes), foil: false, rainbow: false, imageSmall: raw.images.small, imageLarge: raw.images.large, types: raw.types ?? [], artist: raw.artist ?? null }
}

test('special pack builders cover every set with a companion pool', () => {
  const { specialPackBuilder } = require('../lib/pack-builders.ts')
  const { BINDER_COMPANION_SETS } = require('../lib/set-companions.ts')
  for (const [setId, companions] of Object.entries(BINDER_COMPANION_SETS)) {
    assert.deepEqual([specialPackBuilder(setId)?.companionSetId], companions, setId)
  }
  assert.equal(typeof specialPackBuilder('g1')?.build, 'function')
  assert.equal(specialPackBuilder('g1').companionSetId, undefined)
  assert.equal(specialPackBuilder('base1'), undefined)
  assert.equal(specialPackBuilder('constructor'), undefined)
})

test('both Shiny Vaults are complete and appear in their parent binder', async () => {
  const originalFetch = global.fetch
  global.fetch = async () => Response.json({ data: [] })
  try {
    const { getSetCatalogue } = require('../lib/pokemon.ts')
    for (const [parent, vault, total] of [['sm115', 'sma', 163], ['swsh45', 'swsh45sv', 195]]) {
      const catalogue = await getSetCatalogue(parent)
      assert.equal(catalogue.length, total)
      assert.equal(new Set(catalogue.map(c => c.id)).size, total)
      assert.ok(catalogue.some(c => c.id.startsWith(`${vault}-`)))
    }
  } finally { global.fetch = originalFetch }
})

test('Shiny Vault cards occupy only the reverse slot with both shiny categories pullable', () => {
  const originalRandom = Math.random
  let seed = 123456
  Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32)
  try {
    for (const [parent, vault] of [['sm115', 'sma'], ['swsh45', 'swsh45sv']]) {
      const main = snapshot.sets[parent].map(card)
      const extra = snapshot.sets[vault].map(card)
      let hits = 0, babies = 0, fullArts = 0
      for (let i = 0; i < 2000; i++) {
        const pack = buildShinyVaultCards(main, extra, 10)
        assert.equal(pack.length, 10)
        pack.forEach((c, slot) => {
          if (c.id.startsWith(`${vault}-`)) {
            assert.equal(slot, 8)
            assert.equal(c.foil, true)
            hits++
            if (c.rarity === 'Rare Shiny') babies++
            else fullArts++
          }
        })
      }
      assert.ok(hits > 400 && hits < 600, `Unexpected simulated vault rate: ${hits}/2000`)
      assert.ok(babies > 0 && fullArts > 0)
    }
  } finally { Math.random = originalRandom }
})

test('Delta Reign opens from a complete committed pool without card API requests', async () => {
  const originalFetch = global.fetch
  global.fetch = async url => {
    assert.ok(String(url).includes('/sets'), 'Card pools should not need a live request')
    return Response.json({ data: [] })
  }
  try {
    const { getSetCatalogue, openPack } = require('../lib/pokemon.ts')
    const { ensurePacksLoaded } = require('../lib/packs.ts')
    const packs = await ensurePacksLoaded()
    const delta = packs.find(p => p.id === 'me6')
    assert.equal(delta.slug, 'delta-reign')
    assert.equal(delta.total, 141)
    assert.equal((await getSetCatalogue('me6')).length, 141)
    for (let i = 0; i < 100; i++) {
      const opened = await openPack('me6')
      assert.equal(opened.cards.length, 10)
      assert.equal(opened.poolTotal, 141)
      assert.ok(opened.cards.every(c => c.id.startsWith('me6-')))
    }
  } finally { global.fetch = originalFetch }
})

test('current totals repair saved completion and a pack counts repeated cards exactly once per copy', () => {
  const data = emptyCollection()
  data.sets.sm10 = { setId: 'sm10', poolTotal: 234, packsOpened: 100 }
  for (const raw of snapshot.sets.sm10) data.cards[raw.id] = { ...card(raw), setId: 'sm10', count: 1 }
  assert.equal(summarizeSet(data, 'sm10', 238).completion, 1)
  assert.equal(summarizeSet(data, 'sm10', 238).poolTotal, 238)
  const c = card(snapshot.sets.sm115[0])
  const next = mergePackIntoCollection(emptyCollection(), { setId: 'sm115', cards: [c, c, c], poolTotal: 163 })
  assert.equal(next.cards[c.id].count, 3)
  assert.equal(next.totalPacksOpened, 1)
  assert.equal(next.totalCardsPulled, 3)
})

test('limits validate environment settings and the emergency switch supplies a retry hint', () => {
  const saved = process.env.PACK_OPEN_PER_MINUTE
  process.env.PACK_OPEN_PER_MINUTE = '-1'
  assert.deepEqual(limitsFor('user'), { minute: 30, hour: 300 })
  process.env.PACK_OPEN_PER_MINUTE = '45'
  assert.equal(limitsFor('user').minute, 45)
  if (saved === undefined) delete process.env.PACK_OPEN_PER_MINUTE
  else process.env.PACK_OPEN_PER_MINUTE = saved
  process.env.PACK_OPENINGS_PAUSED = 'true'
  assert.equal(packOpeningPauseResponse().status, 503)
  assert.equal(packOpeningPauseResponse().headers.get('Retry-After'), '60')
  delete process.env.PACK_OPENINGS_PAUSED
})

test('cooldowns select the longest exceeded window and expire at the boundary', async () => {
  let row = { minute_count: 31, hour_count: 301 }
  const connection = { execute: async sql => sql.startsWith('SELECT') ? [[row]] : [{}] }
  const now = Date.UTC(2026, 10, 24, 12, 34, 10)
  assert.equal(await takePackOpenToken(connection, 'test', { minute: 30, hour: 300 }, now), 1550)
  row = { minute_count: 31, hour_count: 50 }
  assert.equal(await takePackOpenToken(connection, 'test', { minute: 30, hour: 300 }, now), 50)
  row = { minute_count: 30, hour_count: 300 }
  assert.equal(await takePackOpenToken(connection, 'test', { minute: 30, hour: 300 }, now), 0)
})
