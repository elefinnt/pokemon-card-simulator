import Link from 'next/link'
import { Pokeball } from '@/components/poke-card'
import {
  CURATED_SET_IDS,
  FALLBACK_SET_META,
  PACK_OVERRIDES,
} from '@/lib/pack-overrides'
import { GUIDES } from '@/lib/guides'
import { packPath } from '@/lib/nav'

const POPULAR_SET_IDS = ['base1', 'sv3pt5', 'swsh7', 'sv8pt5'] as const

interface FooterLink {
  href: string
  label: string
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: FooterLink[]
}) {
  return (
    <nav aria-label={title} className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Site-wide footer. The clear, link-rich structure helps search engines
 *  understand which pages matter and is a prerequisite for earning sitelinks. */
export function SiteFooter() {
  const explore: FooterLink[] = [
    { href: '/', label: 'Open packs' },
    { href: '/community', label: 'Community pulls' },
    { href: '/guides', label: 'TCG guides' },
    { href: '/faq', label: 'FAQ' },
    { href: '/about', label: 'About' },
  ]

  const popularPacks: FooterLink[] = POPULAR_SET_IDS.filter((id) =>
    CURATED_SET_IDS.includes(id),
  ).map((id) => ({
    href: packPath(PACK_OVERRIDES[id].slug),
    label: FALLBACK_SET_META[id].name,
  }))

  const guideLinks: FooterLink[] = GUIDES.slice(0, 4).map((guide) => ({
    href: `/guides/${guide.slug}`,
    label: guide.title,
  }))

  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Pokeball className="h-6 w-6" />
              <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
                PackRip
              </span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              A free Pokémon booster pack opening simulator. Rip packs, chase
              the holos and track your collection.
            </p>
          </div>

          <FooterColumn title="Explore" links={explore} />
          <FooterColumn title="Popular packs" links={popularPacks} />
          <FooterColumn title="Guides" links={guideLinks} />
        </div>

        <div className="mt-10 border-t border-border/60 pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground/80">
            PackRip is an unofficial fan-made simulator and is not affiliated
            with, endorsed or sponsored by Nintendo, The Pokémon Company or Game
            Freak. Pokémon and all related names are trademarks of their
            respective owners.
          </p>
        </div>
      </div>
    </footer>
  )
}
