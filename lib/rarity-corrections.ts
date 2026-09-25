/**
 * Pokémon TCG API rarity labels that disagree with the printed card.
 * Applied before tier and pull-rate classification.
 *
 * White Flare Archen #131/86 is an Illustration Rare. The regular Archen
 * (#50) stays Uncommon. Red Victini #172/86 is a Black White Rare, the same
 * label the API already uses for Reshiram ex #173.
 */
const RARITY_CORRECTIONS: Record<string, string> = {
  'rsv10pt5-131': 'Illustration Rare',
  'rsv10pt5-172': 'Black White Rare',
}

export function correctedRarity(cardId: string, rarity: string): string {
  return RARITY_CORRECTIONS[cardId] ?? rarity
}
