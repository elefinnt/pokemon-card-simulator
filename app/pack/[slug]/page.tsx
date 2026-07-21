import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CURATED_SET_IDS, PACK_OVERRIDES } from '@/lib/pack-overrides'
import { ensurePacksLoaded, findPackBySlug, type PackDef } from '@/lib/packs'
import { packPath } from '@/lib/nav'
import { warmCuratedPools } from '@/lib/pokemontcg/warm'
import { PackSimulator } from '@/components/pack-simulator'
import { PageShell } from '@/components/page-shell'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packrip.org'

export function generateStaticParams() {
  return CURATED_SET_IDS.map((id) => ({ slug: PACK_OVERRIDES[id].slug }))
}

async function packForSlug(slug: string): Promise<PackDef | undefined> {
  const packs = await ensurePacksLoaded()
  return findPackBySlug(packs, slug)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const pack = await packForSlug(slug)
  if (!pack) return { title: 'Pack not found · PackRip' }

  const title = `${pack.name} Pack Simulator — Open Pokémon Booster Packs | PackRip`
  const description = `Rip open ${pack.name} (${pack.series} Series, ${pack.year}) Pokémon booster packs online for free. ${pack.blurb}`

  return {
    title,
    description,
    alternates: { canonical: packPath(pack.slug) },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${packPath(pack.slug)}`,
      siteName: 'PackRip',
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

function packJsonLd(pack: PackDef) {
  const url = `${siteUrl}${packPath(pack.slug)}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: `${pack.name} Pack Simulator`,
        description: pack.blurb,
        url,
        isPartOf: { '@type': 'WebSite', name: 'PackRip', url: siteUrl },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Packs', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: pack.name, item: url },
        ],
      },
    ],
  }
}

export default async function PackPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const packs = await ensurePacksLoaded()
  const pack = findPackBySlug(packs, slug)
  if (!pack) notFound()

  warmCuratedPools().catch(() => {})

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(packJsonLd(pack)) }}
      />
      <PackSimulator packs={packs} initialPack={pack} />
    </PageShell>
  )
}
