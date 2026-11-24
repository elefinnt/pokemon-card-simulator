import Link from 'next/link'
import { directoryGroups } from '@/lib/site-discovery'

/** All links are present in server-rendered HTML, without an era-tab click. */
export function PackDirectory() {
  const groups = directoryGroups()
  return (
    <div className="space-y-10">
      <nav aria-label="Jump to a Pokémon series" className="flex flex-wrap gap-x-4 gap-y-3">
        {groups.map(group => (
          <a key={group.series} href={`#${group.anchor}`} className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
            {group.series}
          </a>
        ))}
      </nav>
      {groups.map(group => (
        <section key={group.series} id={group.anchor} className="scroll-mt-6" aria-labelledby={`${group.anchor}-title`}>
          <h2 id={`${group.anchor}-title`} className="font-display text-2xl font-bold text-foreground">{group.series}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {group.packs.map(pack => (
              <li key={pack.id} className="rounded-xl border border-border bg-card/40 p-5">
                <Link prefetch={false} href={`/pack/${pack.slug}`} className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:underline">
                  {pack.name} pack simulator
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">{pack.year} · {pack.total} collectible cards</p>
                <p className="mt-3 leading-relaxed text-muted-foreground">{pack.blurb}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
