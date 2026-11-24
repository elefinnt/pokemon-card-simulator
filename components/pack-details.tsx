import Link from 'next/link'
import type { PackDef } from '@/lib/packs'
import { binderGroupsForPack } from '@/lib/set-companions'
import { FREE_PACK_LIMIT } from '@/lib/free-packs-config'

export function PackDetails({ pack }: { pack: PackDef }) {
  const groups = binderGroupsForPack(pack.id)
  return (
    <div className="mx-auto mt-12 max-w-3xl space-y-4 border-t border-border pt-8 text-base leading-relaxed text-muted-foreground">
      <h2 className="font-display text-2xl font-bold text-foreground">About the {pack.name} pack simulator</h2>
      <p>{pack.blurb}</p>
      <p>
        {pack.name} belongs to the {pack.series} series and was released in {pack.year}.
        {' '}A simulated booster on PackRip contains {pack.packSize} cards, and the collection binder covers {pack.total} different cards for this pack.
      </p>
      {groups && (
        <p>The binder includes {groups.map(group => `${group.label} (${group.total} cards)`).join(' and ')}.</p>
      )}
      <p>
        You can try {FREE_PACK_LIMIT} packs as a guest. Sign in free to save your pulls, track duplicates and set completion, and trade simulated cards with friends.
        {' '}Pulls follow simulator rules and approximate rarity rates; opening a pack here does not purchase physical cards.
      </p>
      <p>
        <Link prefetch={false} href="/packs" className="font-semibold text-primary underline-offset-4 hover:underline">Browse all Pokémon sets</Link>
        {' · '}
        <Link href="/guides/understanding-pokemon-tcg-pull-rates" className="text-primary underline-offset-4 hover:underline">How pull rates work</Link>
        {' · '}
        <Link href="/faq" className="text-primary underline-offset-4 hover:underline">Questions about PackRip</Link>
      </p>
    </div>
  )
}
