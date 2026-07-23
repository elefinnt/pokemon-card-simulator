/**
 * Frequently asked questions, shared by the `/faq` page, the homepage teaser
 * and the FAQPage structured data. Keeping the copy here means the visible
 * answers and the JSON-LD never drift apart.
 */

import { FREE_PACK_LIMIT } from '@/lib/free-packs'

export interface FaqItem {
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is PackRip free to play?',
    answer: `Yes, PackRip is completely free. There are no subscriptions, no premium tiers and nothing to buy. Open ${FREE_PACK_LIMIT} free packs as a guest, or sign in free for unlimited packs.`,
  },
  {
    question: 'Do I need an account to open packs?',
    answer: `No account is needed to get started — every visitor can rip ${FREE_PACK_LIMIT} free packs. Signing in is also free and unlocks unlimited packs plus permanent collection tracking, so the cards you pull are saved to your profile.`,
  },
  {
    question: 'Are the pull rates realistic?',
    answer:
      'Each set is modelled on its real rarity structure, so commons, uncommons, rare holos and the modern ultra-rare and secret-rare slots appear at rates that approximate genuine booster odds. Chasing a specific alt-art still takes plenty of packs, just like the real thing.',
  },
  {
    question: 'Which Pokémon sets can I open?',
    answer:
      'The catalogue spans classics such as Base Set, Jungle and Fossil right through to the latest Scarlet & Violet and Mega Evolution releases. New sets are added as they launch.',
  },
  {
    question: 'Does PackRip cost money or involve gambling?',
    answer:
      'No. There is no real money, no purchases and no gambling of any kind. PackRip is a simulator built for the fun of opening packs and tracking a collection — you never spend a penny.',
  },
  {
    question: 'Does PackRip track my collection?',
    answer:
      'Yes. Once you sign in, every card you pull is saved and your completion progress is tracked across each set, so you can see exactly how close you are to finishing a set.',
  },
  {
    question: 'Where do the card data and images come from?',
    answer:
      'Card names, set details and artwork are sourced from the Pokémon TCG API, which keeps set metadata and images consistent with the official releases.',
  },
  {
    question: 'Is PackRip affiliated with Nintendo or The Pokémon Company?',
    answer:
      'No. PackRip is an unofficial, fan-made simulator and is not affiliated with, endorsed or sponsored by Nintendo, The Pokémon Company or Game Freak. All trademarks belong to their respective owners.',
  },
]
