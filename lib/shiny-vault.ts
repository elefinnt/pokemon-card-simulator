import type { PokemonCard } from './pokemon'

export const SHINY_VAULT_COMPANIONS: Record<string, string> = {
  sm115: 'sma',
  swsh45: 'swsh45sv',
}

// Simulator weights, not official published pull rates. Vault cards replace
// the reverse slot; they never dilute the main set's rare slot or fillers.
export const SHINY_VAULT_CHANCE = 1 / 4

function pick(cards: PokemonCard[]): PokemonCard | undefined {
  return cards[Math.floor(Math.random() * cards.length)]
}

export function buildShinyVaultCards(
  main: PokemonCard[],
  vault: PokemonCard[],
  size: number,
  boostHit = false,
): PokemonCard[] {
  const commons = main.filter(card => card.tier === 'common')
  const uncommons = main.filter(card => card.tier === 'uncommon')
  const rares = main.filter(card => card.tier === 'rare')
  const ultras = main.filter(card => card.tier === 'ultra')
  const reversePool = [...commons, ...uncommons, ...rares]
  const babyShinies = vault.filter(card => card.rarity === 'Rare Shiny')
  const fullArts = vault.filter(card => card.rarity !== 'Rare Shiny')
  const cards: PokemonCard[] = []
  for (let i = 0; i < Math.max(1, size - 5); i++) {
    const card = pick(commons) ?? pick(uncommons) ?? pick(rares)
    if (card) cards.push(card)
  }
  for (let i = 0; i < 3; i++) {
    const card = pick(uncommons) ?? pick(commons) ?? pick(rares)
    if (card) cards.push(card)
  }
  let reverse: PokemonCard | undefined
  if (vault.length && Math.random() < (boostHit ? 0.7 : SHINY_VAULT_CHANCE)) {
    reverse = pick(Math.random() < 0.75 ? babyShinies : fullArts) ?? pick(vault)
  } else {
    reverse = pick(reversePool)
  }
  if (reverse) cards.push({ ...reverse, foil: true })
  const hit = Math.random() < (boostHit ? 0.75 : 0.16)
    ? pick(ultras) ?? pick(rares)
    : pick(rares) ?? pick(ultras) ?? pick(uncommons) ?? pick(commons)
  if (hit) cards.push(hit)
  return cards
}
