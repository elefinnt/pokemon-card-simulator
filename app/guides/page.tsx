import type { Metadata } from 'next'
import { GUIDES } from '@/lib/guides'
import { PageShell } from '@/components/page-shell'
import { ContentPage } from '@/components/content/content-page'
import { GuideCard } from '@/components/guides/guide-card'

const title = 'Pokémon TCG Guides — PackRip'
const description =
  'In-depth, hand-written guides on the Pokémon Trading Card Game: how booster packs work, understanding pull rates, set history and more.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/guides' },
  openGraph: {
    title,
    description,
    url: '/guides',
    siteName: 'PackRip',
    locale: 'en_GB',
    type: 'website',
  },
}

export default function GuidesPage() {
  return (
    <PageShell>
      <ContentPage
        eyebrow="Guides"
        title="Pokémon TCG guides"
        intro={[
          'Hand-written guides on how the Pokémon Trading Card Game works — from booster pack anatomy to pull rates and set history.',
        ]}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {GUIDES.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </ContentPage>
    </PageShell>
  )
}
