import type { Metadata } from 'next'
import { ensurePacksLoaded } from '@/lib/packs'
import { PackSimulator } from '@/components/pack-simulator'
import { PageShell } from '@/components/page-shell'

export const metadata: Metadata = {
  title: 'Community Pulls — PackRip',
  description:
    'See the rarest Pokémon cards the PackRip community is pulling from booster packs right now.',
  alternates: { canonical: '/community' },
}

export default async function CommunityPage() {
  const packs = await ensurePacksLoaded()

  return (
    <PageShell>
      <PackSimulator packs={packs} initialView="community" />
    </PageShell>
  )
}
