import type { Metadata } from 'next'
import { ensurePacksLoaded } from '@/lib/packs'
import { warmCuratedPools } from '@/lib/pokemontcg/warm'
import { PackSimulator } from '@/components/pack-simulator'
import { PageShell } from '@/components/page-shell'
import { HomeFaq } from '@/components/home/home-faq'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function Page() {
  const packs = await ensurePacksLoaded()

  // Fire-and-forget: warm card pools in the background after the page renders.
  warmCuratedPools().catch(() => {})

  return (
    <PageShell>
      <PackSimulator packs={packs} />
      <HomeFaq />
    </PageShell>
  )
}
