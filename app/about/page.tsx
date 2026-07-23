import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { ContentPage } from '@/components/content/content-page'
import { FREE_PACK_LIMIT } from '@/lib/free-packs-config'

const title = 'About — PackRip'
const description =
  'PackRip is a free Pokémon booster pack opening simulator. Learn what it is, how it works and why we built it.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    title,
    description,
    url: '/about',
    siteName: 'PackRip',
    locale: 'en_GB',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <PageShell>
      <ContentPage
        eyebrow="About"
        title="About PackRip"
        intro={[
          'PackRip is a free Pokémon booster pack opening simulator. Pick a set, tear open a pack and reveal every card one at a time — holo shine, sparkles and rare-hit celebrations included.',
        ]}
      >
        <div className="space-y-8 leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-foreground">
              What PackRip is
            </h2>
            <p>
              PackRip recreates the thrill of ripping a booster pack without the
              cost. There is no real money, no purchases and no gambling — just
              the fun of chasing that holo and building a collection across
              classic and modern sets.
            </p>
            <p>
              Every visitor can open {FREE_PACK_LIMIT} free packs. Signing in is
              free and unlocks unlimited packs plus permanent collection
              tracking, so the cards you pull are saved to your profile.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-foreground">
              How it works
            </h2>
            <p>
              Each set is modelled on its real rarity structure, so commons,
              reverse holos, rares and the modern ultra-rare and secret-rare
              slots appear at rates that approximate genuine booster odds. Card
              data and artwork come from the Pokémon TCG API.
            </p>
            <p>
              Want the detail? Read our{' '}
              <Link
                href="/guides/understanding-pokemon-tcg-pull-rates"
                className="text-primary underline-offset-4 hover:underline"
              >
                guide to Pokémon TCG pull rates
              </Link>
              , or browse{' '}
              <Link
                href="/guides"
                className="text-primary underline-offset-4 hover:underline"
              >
                all of our guides
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-foreground">
              A note on trademarks
            </h2>
            <p>
              PackRip is an unofficial, fan-made project and is not affiliated
              with, endorsed or sponsored by Nintendo, The Pokémon Company or
              Game Freak. Pokémon and all related names are trademarks of their
              respective owners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Have a question?
            </h2>
            <p>
              Check the{' '}
              <Link
                href="/faq"
                className="text-primary underline-offset-4 hover:underline"
              >
                frequently asked questions
              </Link>{' '}
              for quick answers, or head back to the{' '}
              <Link
                href="/"
                className="text-primary underline-offset-4 hover:underline"
              >
                packs
              </Link>{' '}
              and start ripping.
            </p>
          </section>
        </div>
      </ContentPage>
    </PageShell>
  )
}
