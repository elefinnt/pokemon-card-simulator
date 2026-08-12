import type { GuideExampleCard } from '@/lib/guides'

function cardImageUrl(cardId: string): string {
  const splitAt = cardId.lastIndexOf('-')
  const setId = cardId.slice(0, splitAt)
  const number = cardId.slice(splitAt + 1)
  return `https://images.pokemontcg.io/${setId}/${number}.png`
}

export function GuideCardExamples({ cards }: { cards: GuideExampleCard[] }) {
  return (
    <ul className="flex flex-wrap gap-4 pt-2">
      {cards.map((card) => (
        <li key={card.id} className="w-36 space-y-1.5 sm:w-40">
          <img
            src={cardImageUrl(card.id)}
            alt={`${card.name} — ${card.set}`}
            loading="lazy"
            className="w-full rounded-lg shadow-md"
          />
          <p className="text-xs leading-snug">
            <span className="font-semibold text-foreground">{card.name}</span>
            <br />
            {card.set}
          </p>
        </li>
      ))}
    </ul>
  )
}
