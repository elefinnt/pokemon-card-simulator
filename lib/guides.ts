/**
 * Hand-written Pokémon TCG guides. These are static long-form articles that
 * give search engines substantial, unique content to index and give visitors
 * genuinely useful reading. Add new guides by appending to `GUIDES`.
 */

export interface GuideSection {
  heading: string
  paragraphs: string[]
}

export interface Guide {
  /** Stable URL slug — articles live at `/guides/{slug}`. */
  slug: string
  title: string
  /** One-line summary used for cards, meta descriptions and the index. */
  description: string
  /** ISO date, e.g. `2026-07-01`. Feeds the sitemap and article metadata. */
  updated: string
  readingMinutes: number
  /** Opening paragraphs shown under the title before the first section. */
  intro: string[]
  sections: GuideSection[]
}

export const GUIDES: Guide[] = [
  {
    slug: 'how-pokemon-booster-packs-work',
    title: 'How Pokémon Booster Packs Work',
    description:
      'What is really inside a modern Pokémon booster pack, from the guaranteed rare slot to the reverse holo and the coveted hit.',
    updated: '2026-07-01',
    readingMinutes: 5,
    intro: [
      'Every Pokémon booster pack follows a hidden recipe. Understanding that recipe explains why some cards feel common while others take box after box to find.',
      'This guide breaks down the slots inside a typical modern pack and how they shape what you pull.',
    ],
    sections: [
      {
        heading: 'The common and uncommon slots',
        paragraphs: [
          'The bulk of any pack is made up of commons and uncommons. These fill most of the pack and form the backbone of a set, including the Trainer cards and basic Energy that make decks playable.',
          'While they are the least exciting to pull, commons and uncommons are essential for set completion, and many older commons have become surprisingly collectable over time.',
        ],
      },
      {
        heading: 'The guaranteed rare slot',
        paragraphs: [
          'Every pack guarantees at least one card of rare or higher. In older sets this was often a non-holo rare; in modern sets this slot frequently upgrades into a holo, an ex, or a higher rarity entirely.',
          'This is the slot most people watch, because it is where the value of a pack usually lives.',
        ],
      },
      {
        heading: 'The reverse holo slot',
        paragraphs: [
          'Modern packs include a reverse holo — a card of any rarity with a shimmering, patterned foil across the whole card rather than just the artwork. Reverse holos give even common cards a premium finish and are a collecting category all of their own.',
        ],
      },
      {
        heading: 'Chasing the hit',
        paragraphs: [
          'The rarest cards — ultra rares, secret rares and alternate arts — appear far less often than once per pack. Depending on the set, a single chase card might show up only once every several booster boxes.',
          'That scarcity is exactly what makes opening packs exciting, and it is faithfully reflected when you rip a pack on PackRip.',
        ],
      },
    ],
  },
  {
    slug: 'understanding-pokemon-tcg-pull-rates',
    title: 'Understanding Pokémon TCG Pull Rates',
    description:
      'Why some cards are so much harder to pull than others, and what pull rates really mean when you open Pokémon booster packs.',
    updated: '2026-07-01',
    readingMinutes: 6,
    intro: [
      'Pull rate is the probability of finding a particular card, or type of card, in any given pack. It is the single most important idea behind why collecting feels the way it does.',
      'Here is how pull rates work and why chasing a specific card can take so long.',
    ],
    sections: [
      {
        heading: 'Rarity tiers',
        paragraphs: [
          'Cards are grouped into rarity tiers, from common and uncommon up through rare holo and into the modern ultra-rare and secret-rare brackets. Each tier appears at its own frequency, and the rarer the tier, the fewer packs contain it.',
          'A set might contain dozens of secret rares, so even when you hit the rare slot, the chance of it being the specific card you want is small.',
        ],
      },
      {
        heading: 'Why averages can mislead',
        paragraphs: [
          'A stated rate such as "one ultra rare every so many packs" is an average across a huge sample. In practice, luck is streaky: you might hit two in a row, or open a long dry spell.',
          'This is the gambler’s fallacy in reverse — a pack has no memory, so a bad run does not make the next pull any more likely.',
        ],
      },
      {
        heading: 'How PackRip models odds',
        paragraphs: [
          'PackRip assigns each set a rarity structure that approximates its real booster configuration, then rolls each pack against those odds. The result is a pull experience that feels close to the real thing, complete with the occasional heart-stopping hit.',
        ],
      },
    ],
  },
  {
    slug: 'pokemon-base-set-history',
    title: 'A Brief History of the Pokémon Base Set',
    description:
      'The story of the 1999 Base Set — the release that started the Pokémon Trading Card Game and gave us the iconic holo Charizard.',
    updated: '2026-07-01',
    readingMinutes: 5,
    intro: [
      'The Base Set is where the Pokémon Trading Card Game began. Released in 1999 in English, it introduced the mechanics, artwork and chase cards that still define the hobby.',
    ],
    sections: [
      {
        heading: 'A brand-new game',
        paragraphs: [
          'Base Set launched with 102 cards and taught a generation how to play, pairing simple, readable rules with artwork that became instantly iconic.',
          'Its first-edition and shadowless printings are now among the most sought-after cards in the entire hobby.',
        ],
      },
      {
        heading: 'The Charizard effect',
        paragraphs: [
          'No card captures the era like the holographic Charizard. It became the ultimate chase card and remains a grail for collectors decades later.',
          'The thrill of hoping for that holo in the rare slot is a feeling PackRip aims to recreate every time you rip a Base Set pack.',
        ],
      },
      {
        heading: 'A lasting legacy',
        paragraphs: [
          'Base Set was followed quickly by Jungle and Fossil, expanding the roster and cementing the collecting habit. Together they form the foundation every later set builds on.',
        ],
      },
    ],
  },
]

export function findGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}
