/**
 * Frequently asked questions, shared by the `/faq` page, the homepage teaser
 * and the FAQPage structured data. Keeping the copy here means the visible
 * answers and the JSON-LD never drift apart.
 */

import { FREE_PACK_LIMIT } from '@/lib/free-packs-config'

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
    question: 'Can I rip Pokémon packs online for free?',
    answer:
      'Yes. PackRip lets you rip Pokémon packs online for free — pick a set, tear the booster open and flip your cards one by one. There is nothing to download and nothing to pay.',
  },
  {
    question: 'What is a Pokémon booster pack?',
    answer:
      'A Pokémon booster pack is a sealed pack of randomised trading cards from a particular set, typically containing around ten cards: a mix of commons and uncommons, a reverse holo and at least one card of rare or higher. The random rare slot is what makes opening packs exciting — you never know whether the next pack hides a chase card.',
  },
  {
    question: 'What are Base Set Pokémon cards?',
    answer:
      'Base Set cards come from the very first English Pokémon TCG release in 1999. The set contains 102 cards, including the legendary holographic Charizard, and its first-edition and shadowless printings are among the most valuable Pokémon cards ever made. You can rip simulated Base Set packs on PackRip and chase the same iconic holos.',
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
      'Over fifty sets spanning the whole history of the TCG — classics such as Base Set, Team Rocket and Neo Genesis, fan favourites like Hidden Fates, Evolving Skies and 151, right through to the latest Scarlet & Violet and Mega Evolution releases. New sets are added as they launch.',
  },
  {
    question: 'Can I request a pack or share feedback?',
    answer:
      'Yes. Use the Feedback button in the corner, or the request link under the pack list, to ask for a set we do not have yet, report a bug, or suggest a feature. If you tick the contact box, I will only email you about that feedback — for example if your pack makes it onto the site.',
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
