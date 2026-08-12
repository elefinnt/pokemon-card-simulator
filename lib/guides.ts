/**
 * Hand-written Pokémon TCG guides. These are static long-form articles that
 * give search engines substantial, unique content to index and give visitors
 * genuinely useful reading. Add new guides by appending to `GUIDES`.
 */

import type { CardTier } from './pokemon'

export interface GuideExampleCard {
  /** Pokémon TCG API card id, e.g. `base1-4`. Images are vendored locally at
   *  `/cards/{id}.webp` and `/cards/{id}_hires.webp` (see `scripts/convert-guide-cards.mjs`). */
  id: string
  name: string
  /** Display label for the set/context, e.g. `Base Set, 1999`. */
  set: string
  /** Sim rarity tier — drives the glow colour and hover treatment. */
  tier: CardTier
  /** Renders the holographic shine overlay in the zoomed view. */
  foil?: boolean
}

export interface GuideSection {
  heading: string
  paragraphs: string[]
  /** Optional real cards shown as a gallery beneath the paragraphs. */
  exampleCards?: GuideExampleCard[]
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
    slug: 'rip-pokemon-packs-online-free',
    title: 'How to Rip Pokémon Packs Online for Free',
    description:
      'Everything you need to know about ripping Pokémon packs online for free — how pack opening simulators work and what separates the best card opening apps from the rest.',
    updated: '2026-08-11',
    readingMinutes: 5,
    intro: [
      'You do not need to spend a penny to feel the rush of tearing open a booster. Pack opening simulators recreate the whole experience — the sealed pack, the rip, the card-by-card reveal — entirely in your browser.',
      'This guide covers how ripping packs online works, and what to look for when choosing a card opening app.',
    ],
    sections: [
      {
        heading: 'What a pack rip simulator actually does',
        paragraphs: [
          'A pack rip simulator models a real booster pack: it takes the genuine card list for a set, applies rarity odds that approximate the real pull rates, and deals you a virtual pack. Every card you flip is a real card from the set, with the real artwork — the only difference is that the pack is digital.',
          'Because the odds mirror the real thing, the experience is faithful. Commons fill most of the pack, the rare slot carries the tension, and the big hits stay genuinely rare.',
        ],
      },
      {
        heading: 'Ripping free packs on PackRip',
        paragraphs: [
          'On PackRip every visitor can rip free packs straight away — no account, no download and no payment. Pick any set from Base Set through to the latest releases, tap the sealed booster and flip your pulls one at a time.',
          'Signing in is also free and unlocks unlimited packs, plus a binder that saves every card you pull and tracks your completion for each set.',
        ],
      },
      {
        heading: 'What separates the best card opening apps',
        paragraphs: [
          'The best card opening apps share a few traits: realistic pull rates rather than a hit every pack, real card data and artwork rather than approximations, a collection tracker that gives your pulls somewhere to live, and no real-money mechanics dressed up as gameplay.',
          'Be wary of apps that charge for virtual packs or lean on gambling-style pressure. A simulator should be about the fun of the rip, not a way to spend money on cards that do not exist.',
        ],
      },
      {
        heading: 'Simulators and the real hobby',
        paragraphs: [
          'Ripping packs online is not a replacement for collecting — it is a companion to it. A simulator lets you learn a set before buying real boosters, scratch the itch between purchases, and experience sets that are long out of print, like ripping a 1999 Base Set pack without the four-figure price tag.',
        ],
      },
    ],
  },
  {
    slug: 'pokemon-tcg-30th-celebration',
    title: 'Pokémon TCG: 30th Celebration — Everything We Know',
    description:
      'The 30th Celebration expansion releases worldwide on 16 September 2026 — all-foil packs, a Pikachu in every pack, the new Futuristic rare and 30 classic reprints. Here is everything revealed so far.',
    updated: '2026-08-12',
    readingMinutes: 6,
    intro: [
      'The Pokémon Trading Card Game turns 30 in 2026, and it is marking the occasion with a commemorative expansion: Pokémon TCG: 30th Celebration, releasing worldwide on 16 September 2026.',
      'It is the first set in the history of the game to launch simultaneously across the world, and it follows the beloved formula of 2021’s Celebrations — with some spectacular new twists. Here is everything we know ahead of release.',
    ],
    sections: [
      {
        heading: 'Release date and format',
        paragraphs: [
          '30th Celebration arrives at retailers worldwide on 16 September 2026, with the digital version landing a day earlier on Pokémon TCG Live. The main set runs to 128 numbered cards, with secret rares numbered beyond that — around 150 cards in total.',
          'Packs contain six cards, and every single one is foil — even the Basic Energy. Like Celebrations before it, booster packs will not be sold individually; they come inside special products such as the Elite Trainer Box, the Poster Collection and the Pokémon ex Box.',
        ],
      },
      {
        heading: 'A Pikachu in every pack',
        paragraphs: [
          'Every 30th Celebration booster pack is guaranteed to contain one of 30 different Pikachu cards, each with a unique illustration by a different artist. Revealed artists so far include Atsuko Nishida — the original designer of Pikachu — alongside OKACHEKE and Yuu Nishida.',
          'Thirty packs, thirty Pikachu: expect completing the full Pikachu gallery to become one of the defining chases of the year.',
        ],
      },
      {
        heading: 'The new Futuristic rare',
        paragraphs: [
          'The set debuts a brand-new rarity: the Futuristic rare, illustrated by renowned Japanese artist YOSHIROTTEN with a vibrant, opalescent finish. The first two revealed are Mewtwo and Mew, depicted in striking artwork described as “evocative of hope toward an unknown future”.',
          'New Pokémon ex are confirmed too, including Greninja ex, Sylveon ex, and an Espeon ex and Umbreon ex pair headlining a premium deck set.',
        ],
      },
      {
        heading: '30 classic cards return',
        paragraphs: [
          'Following the model of Celebrations’ Classic Collection, 30 classic cards from across the game’s three decades return with a commemorative “30” Pikachu stamp and a fresh foil treatment. They are collector pieces rather than tournament-legal cards — a museum of the hobby’s history in booster form.',
          'If the 25th anniversary set is any guide, these reprints will be among the most chased cards of the entire release.',
        ],
      },
      {
        heading: 'Rip it on PackRip',
        paragraphs: [
          'We will be adding 30th Celebration to PackRip as soon as the full card list goes live, so you can rip the all-foil packs and hunt every Pikachu without spending a penny.',
          'In the meantime, you can relive the last big anniversary by ripping Celebrations packs — the 25th anniversary set with its gold chase cards and Classic Collection reprints — free on PackRip right now.',
        ],
      },
    ],
  },
  {
    slug: 'pokemon-card-rarities-explained',
    title: 'Pokémon Card Rarities Explained',
    description:
      'Every Pokémon card rarity explained — from Common and Reverse Holo through Illustration Rares and gold Hyper Rares, to the brand-new Futuristic rare debuting in 30th Celebration.',
    updated: '2026-08-12',
    readingMinutes: 7,
    intro: [
      'Rarity is the language of Pokémon card collecting. It decides how often a card appears in packs, how much it tends to be worth, and which pulls make your heart race.',
      'This glossary walks through every rarity you will meet in modern packs, the retired rarities from the game’s history, and the brand-new Futuristic rare arriving in the 30th Celebration expansion.',
    ],
    sections: [
      {
        heading: 'How to read a card’s rarity',
        paragraphs: [
          'Look at the bottom of any Pokémon card and you will find a small symbol: a circle for Common, a diamond for Uncommon and a star for Rare and above. Cards numbered beyond the printed set total — such as 200/191 — are secret rares, the scarcest cards in a set.',
          'Modern Scarlet & Violet era cards refine this further, using multiple stars in different colours to distinguish the higher tiers.',
        ],
      },
      {
        heading: 'Common, Uncommon and Rare',
        paragraphs: [
          'Commons (circle) and Uncommons (diamond) fill most of every pack. They form the playable backbone of a set — the early-stage Pokémon, Trainers and Energy every deck needs.',
          'Rares (single black star) occupy the guaranteed rare slot in each pack. In older sets a non-holo rare was often your only prize; in modern packs this slot regularly upgrades into something shinier.',
        ],
        exampleCards: [
          {
            id: 'base1-58',
            name: 'Pikachu',
            set: 'Base Set, 1999 — Common',
            tier: 'common',
          },
        ],
      },
      {
        heading: 'Holo and Reverse Holo',
        paragraphs: [
          'A Rare Holo has foil artwork inside the picture frame — the classic shimmer that made cards like Base Set Charizard legendary. Every modern pack also includes a Reverse Holo: a card of any rarity where everything except the artwork is foiled, giving even a humble Common a premium finish.',
          'Reverse Holo versions exist for most cards in a set, which makes “reverse sets” a popular completion challenge in their own right.',
        ],
        exampleCards: [
          {
            id: 'base1-4',
            name: 'Charizard',
            set: 'Base Set, 1999 — Rare Holo',
            tier: 'rare',
            foil: true,
          },
        ],
      },
      {
        heading: 'Double Rare — the ex cards',
        paragraphs: [
          'Double Rares (two black stars) are the Pokémon ex cards in the Scarlet & Violet era — powerful, playable cards that appear roughly once every few packs. They are the entry point to a set’s chase hierarchy, and previous eras filled the same tier with V, GX and EX cards.',
        ],
        exampleCards: [
          {
            id: 'sv3-125',
            name: 'Charizard ex',
            set: 'Obsidian Flames — Double Rare',
            tier: 'rare',
            foil: true,
          },
        ],
      },
      {
        heading: 'Ultra Rare — full arts',
        paragraphs: [
          'Ultra Rares (two silver stars) are full-art cards: Pokémon ex and Supporter cards where the artwork stretches across the entire card with a textured foil finish. Full-art Trainers of fan-favourite characters are often among the most collected cards in a set.',
        ],
        exampleCards: [
          {
            id: 'sv2-254',
            name: 'Iono',
            set: 'Paldea Evolved — Ultra Rare',
            tier: 'ultra',
            foil: true,
          },
        ],
      },
      {
        heading: 'Illustration Rare and Special Illustration Rare',
        paragraphs: [
          'Illustration Rares (one gold star) are the spiritual successors to the beloved alternate arts of the Sword & Shield era — regular Pokémon presented in gorgeous, scene-setting artwork that tells a little story.',
          'Special Illustration Rares (two gold stars) apply the same treatment to ex Pokémon and Supporters, and they are usually the true chase cards of a modern set. Cards like the Umbreon VMAX alternate art from Evolving Skies — “Moonbreon” to collectors — show how valuable this tier can become.',
        ],
        exampleCards: [
          {
            id: 'sv3pt5-173',
            name: 'Pikachu',
            set: '151 — Illustration Rare',
            tier: 'ultra',
            foil: true,
          },
          {
            id: 'sv3-223',
            name: 'Charizard ex',
            set: 'Obsidian Flames — Special Illustration Rare',
            tier: 'ultra',
            foil: true,
          },
          {
            id: 'swsh7-215',
            name: 'Umbreon VMAX',
            set: 'Evolving Skies — alternate art (“Moonbreon”)',
            tier: 'ultra',
            foil: true,
          },
        ],
      },
      {
        heading: 'Hyper Rare — the gold cards',
        paragraphs: [
          'Hyper Rares (three gold stars) are the gold-foiled secret rares numbered beyond the set total. Modern sets use this tier for golden Pokémon, Trainers and Energy cards. Flashy and scarce, though often worth less than the top Special Illustration Rares despite being harder to pull.',
        ],
        exampleCards: [
          {
            id: 'sv3pt5-205',
            name: 'Mew ex',
            set: '151 — Hyper Rare',
            tier: 'ultra',
            foil: true,
          },
        ],
      },
      {
        heading: 'Futuristic rare — new for 2026',
        paragraphs: [
          'Debuting in the 30th Celebration expansion on 16 September 2026, the Futuristic rare is the newest rarity in the game. Illustrated by renowned Japanese artist YOSHIROTTEN with a vibrant, opalescent finish, the first revealed cards feature Mewtwo and Mew in artwork described as “evocative of hope toward an unknown future”.',
          'As a brand-new tier in an all-foil anniversary set, Futuristic rares are expected to be among the most sought-after pulls of the year.',
        ],
      },
      {
        heading: 'Retired rarities worth knowing',
        paragraphs: [
          'Plenty of rarities live on only in older sets, and they include some of the hobby’s most treasured cards. Shining Pokémon (Neo era) and Gold Stars (EX era) are grails from the early 2000s, while Crystal types from sets like Skyridge command serious prices.',
          'More recently, the Sword & Shield era gave us Amazing Rares with their rainbow paint-splash foil, Radiant Pokémon with reversed shiny colours, and the Trainer Gallery and Galarian Gallery subsets. Ripping older packs on PackRip is a free way to experience chasing them.',
        ],
        exampleCards: [
          {
            id: 'neo3-65',
            name: 'Shining Gyarados',
            set: 'Neo Revelation — Shining',
            tier: 'ultra',
            foil: true,
          },
          {
            id: 'swsh4-138',
            name: 'Rayquaza',
            set: 'Vivid Voltage — Amazing Rare',
            tier: 'ultra',
            foil: true,
          },
          {
            id: 'pgo-11',
            name: 'Radiant Charizard',
            set: 'Pokémon GO — Radiant Rare',
            tier: 'ultra',
            foil: true,
          },
        ],
      },
      {
        heading: 'Does rarity equal value?',
        paragraphs: [
          'Not always. Value follows demand, and demand follows the Pokémon and the artwork. A stunning Illustration Rare of a popular Pokémon routinely outprices a technically rarer gold card, and a nostalgic holo from 1999 can beat both.',
          'Rarity tells you how hard a card is to pull — the market decides the rest.',
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
