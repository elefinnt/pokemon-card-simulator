import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPage } from '@/components/content/content-page'
import { PageShell } from '@/components/page-shell'
import { PackDirectory } from '@/components/pack-directory'
import { StructuredData } from '@/components/structured-data'
import { DISCOVERY_PACKS, directorySchema } from '@/lib/site-discovery'
import { FREE_PACK_LIMIT } from '@/lib/free-packs-config'

const title = 'All Pokémon Pack Simulators — Browse Sets | PackRip'
const description = `Browse ${DISCOVERY_PACKS.length} Pokémon booster pack simulators by series, from Base Set to Mega Evolution. Choose a set and start opening packs for free.`

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: '/packs' },
  openGraph: { title, description, url: '/packs', type: 'website' },
}

export default function PacksPage() {
  return (
    <PageShell>
      <StructuredData data={directorySchema()} />
      <ContentPage
        eyebrow="Pack directory"
        title="Find your next Pokémon pack"
        intro={[
          `Explore all ${DISCOVERY_PACKS.length} sets available on PackRip, grouped by Pokémon TCG series. Each link opens that set's free pack simulator.`,
          `Try ${FREE_PACK_LIMIT} packs as a guest, or sign in free to save your cards and track your collection. Openings use simulated pull rates and may have a short cooldown during very rapid or sustained use.`,
        ]}
      >
        <PackDirectory />
        <p className="mt-10 leading-relaxed text-muted-foreground">
          New to collecting? Read{' '}
          <Link href="/guides/how-pokemon-booster-packs-work" className="text-primary underline-offset-4 hover:underline">how Pokémon booster packs work</Link>{' '}
          and our{' '}
          <Link href="/guides/pokemon-card-rarities-explained" className="text-primary underline-offset-4 hover:underline">card rarity guide</Link>.
        </p>
      </ContentPage>
    </PageShell>
  )
}
