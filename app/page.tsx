import type { Metadata } from 'next'
import { ensurePacksLoaded } from '@/lib/packs'
import { PackSimulator } from '@/components/pack-simulator'
import { PageShell } from '@/components/page-shell'
import { HomeCta } from '@/components/home/home-cta'
import { HomeFaq } from '@/components/home/home-faq'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function Page() {
  const packs = await ensurePacksLoaded()

  return (
    <PageShell>
      <PackSimulator packs={packs} />
      <HomeCta />
      <HomeFaq />
    </PageShell>
  )
}
