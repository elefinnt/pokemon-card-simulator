import type { Metadata } from 'next'
import { ensurePacksLoaded } from '@/lib/packs'
import { PackSimulator } from '@/components/pack-simulator'
import { PageShell } from '@/components/page-shell'

export const metadata: Metadata = {
  title: 'Your Collection — PackRip',
  robots: { index: false },
}

export default async function CollectionPage() {
  const packs = await ensurePacksLoaded()

  return (
    <PageShell>
      <PackSimulator packs={packs} initialView="collection" />
    </PageShell>
  )
}
