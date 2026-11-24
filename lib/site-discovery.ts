import { CURATED_SET_IDS, PACK_OVERRIDES } from './pack-overrides'
import { FALLBACK_SET_META } from './pack-fallback-meta'
import { FREE_PACK_LIMIT } from './free-packs-config'
import { GUIDES } from './guides'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packrip.org').replace(/\/+$/, '')

// The public directory and agent summary share the curated catalogue. Neither
// needs an upstream card API call, a database connection or a signed-in session.
export const DISCOVERY_PACKS = CURATED_SET_IDS.map(id => {
  const meta = FALLBACK_SET_META[id]
  const override = PACK_OVERRIDES[id]
  return {
    id,
    name: id === 'base1' ? 'Base Set' : meta.name,
    series: meta.series,
    year: meta.year,
    total: override.total ?? meta.total,
    slug: override.slug,
    blurb: override.blurb,
  }
})

export function directoryGroups() {
  const groups = new Map<string, typeof DISCOVERY_PACKS>()
  for (const pack of [...DISCOVERY_PACKS].reverse()) {
    const group = groups.get(pack.series) ?? []
    group.push(pack)
    groups.set(pack.series, group)
  }
  return [...groups].map(([series, packs]) => ({
    series, packs, anchor: `series-${series.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  }))
}

export function buildLlmsText(): string {
  return [
    '# PackRip — Pokémon pack opening simulator',
    '',
    `> PackRip at ${SITE_URL} is a free, unofficial Pokémon TCG booster pack opening simulator for the web.`,
    '',
    '## What visitors can do',
    '',
    '- Choose a Pokémon set, open a simulated booster and reveal its cards.',
    `- Open ${FREE_PACK_LIMIT} preview packs as a guest. Sign in with Discord or Google to keep opening and save a collection across devices. Very rapid or sustained opening can trigger a cooldown.`,
    '- Track set completion and duplicate cards, showcase favourite pulls, add friends and trade simulated cards.',
    '- Use the site in a web browser with JavaScript enabled; no app installation is required.',
    '- PackRip has no purchases or real-money pack opening. Simulated cards are not physical cards or redeemable prizes.',
    '',
    '## Scope and sources',
    '',
    `The catalogue contains ${DISCOVERY_PACKS.length} selectable sets. Hidden Fates and Shining Fates include their Shiny Vaults; other supported companion galleries are listed with their parent packs.`,
    'Card names, images and set data come from the Pokémon TCG API. Pull rates are simulator rules and approximations, not published official Pokémon odds.',
    'PackRip is a fan project, unaffiliated with Nintendo, The Pokémon Company and GAME FREAK.',
    '',
    '## Start here',
    '',
    `- [Open packs](${SITE_URL}/): The simulator and current featured set.`,
    `- [All Pokémon sets](${SITE_URL}/packs): Complete public pack directory, grouped by series.`,
    `- [About PackRip](${SITE_URL}/about): Features, access and project information.`,
    `- [Frequently asked questions](${SITE_URL}/faq): Accounts, free previews, collections and cooldowns.`,
    `- [Sitemap](${SITE_URL}/sitemap.xml): Public page URLs.`,
    '',
    '## Pack simulators',
    '',
    ...[...DISCOVERY_PACKS].reverse().map(pack =>
      `- [${pack.name}](${SITE_URL}/pack/${pack.slug}): ${pack.series}, ${pack.year}; ${pack.total} collectible cards in this simulator. ${pack.blurb}`,
    ),
    '',
    '## Guides',
    '',
    ...GUIDES.map(guide => `- [${guide.title}](${SITE_URL}/guides/${guide.slug}): ${guide.description}`),
    '',
  ].join('\n')
}

export function applicationSchema() {
  return {
    '@type': 'WebApplication',
    '@id': `${SITE_URL}/#app`,
    name: 'PackRip',
    url: SITE_URL,
    description: 'A free Pokémon booster pack opening simulator with guest previews, saved collections, set completion, friends and simulated card trading.',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript and a modern web browser.',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

export function directorySchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/packs`,
    name: 'All Pokémon pack simulators — PackRip',
    url: `${SITE_URL}/packs`,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: DISCOVERY_PACKS.length,
      itemListElement: directoryGroups().flatMap(group => group.packs).map((pack, index) => ({
        '@type': 'ListItem', position: index + 1,
        name: `${pack.name} pack simulator`, url: `${SITE_URL}/pack/${pack.slug}`,
      })),
    },
  }
}
