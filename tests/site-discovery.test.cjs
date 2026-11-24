const { test } = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { CURATED_SET_IDS, PACK_OVERRIDES } = require('../lib/pack-overrides.ts')
const { DISCOVERY_PACKS, SITE_URL, directorySchema, applicationSchema } = require('../lib/site-discovery.ts')

test('every curated pack has a normal link in the server-rendered directory', () => {
  const { PackDirectory } = require('../components/pack-directory.tsx')
  const html = renderToStaticMarkup(React.createElement(PackDirectory))
  const links = [...html.matchAll(/href="(\/pack\/[^"?#]+)"/g)].map(match => match[1])
  assert.equal(links.length, CURATED_SET_IDS.length)
  assert.equal(new Set(links).size, CURATED_SET_IDS.length)
  for (const id of CURATED_SET_IDS) assert.ok(links.includes(`/pack/${PACK_OVERRIDES[id].slug}`), id)
  assert.ok(!html.includes('hidden='), 'The complete directory should be visible to readers too')
})

test('the optional text guide includes the full public catalogue and guides', async () => {
  const { GET } = require('../app/llms.txt/route.ts')
  const { GUIDES } = require('../lib/guides.ts')
  const response = GET()
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /^text\/plain/)
  const text = await response.text()
  for (const id of CURATED_SET_IDS) assert.ok(text.includes(`${SITE_URL}/pack/${PACK_OVERRIDES[id].slug}`), id)
  for (const guide of GUIDES) assert.ok(text.includes(`${SITE_URL}/guides/${guide.slug}`))
  assert.ok(text.includes(`${SITE_URL}/packs`))
  assert.ok(!text.includes(`${SITE_URL}/api/`))
  assert.ok(!text.includes('your_key_here'))
})

test('pack details render the parent and companion counts without an interaction', () => {
  const { PackDetails } = require('../components/pack-details.tsx')
  const pack = { ...DISCOVERY_PACKS.find(pack => pack.id === 'sm115'), packSize: 10 }
  const html = renderToStaticMarkup(React.createElement(PackDetails, { pack }))
  assert.match(html, /Shiny Vault \(94 cards\)/)
  assert.match(html, /Main set \(69 cards\)/)
  assert.match(html, /163/)
  assert.match(html, /href="\/packs"/)
})

test('structured directory matches public links and the sitemap contains its canonical URL', () => {
  const schema = directorySchema()
  const items = schema.mainEntity.itemListElement
  assert.equal(schema.mainEntity.numberOfItems, CURATED_SET_IDS.length)
  assert.deepEqual(new Set(items.map(item => item.url)), new Set(DISCOVERY_PACKS.map(pack => `${SITE_URL}/pack/${pack.slug}`)))
  assert.deepEqual(items.map(item => item.position), items.map((_, index) => index + 1))
  const sitemap = require('../app/sitemap.ts').default()
  assert.equal(sitemap.filter(item => item.url === `${SITE_URL}/packs`).length, 1)
  const app = applicationSchema()
  assert.equal(app.url, SITE_URL)
  assert.equal(app.isAccessibleForFree, true)
  assert.equal(app['@type'], 'WebApplication')
})

test('explicit AI search rules preserve private path exclusions', () => {
  const { rules } = require('../app/robots.ts').default()
  for (const agent of ['*', 'OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot']) {
    const rule = rules.find(rule => [rule.userAgent].flat().includes(agent))
    assert.ok(rule, agent)
    assert.equal(rule.allow, '/')
    for (const path of ['/api/', '/profile', '/collection', '/friends']) assert.ok(rule.disallow.includes(path), `${agent}: ${path}`)
  }
})
