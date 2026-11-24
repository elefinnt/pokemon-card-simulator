import {
  buildCelebration30thCards,
  CELEBRATION_30TH_SET_ID,
  CLASSIC_COLLECTION_SET_ID,
} from './celebration-30th'
import {
  buildCelebrationsCards,
  CELEBRATIONS_CLASSIC_SET_ID,
  CELEBRATIONS_SET_ID,
} from './celebrations'
import {
  buildCrownZenithCards,
  CROWN_ZENITH_SET_ID,
  GALARIAN_GALLERY_SET_ID,
} from './crown-zenith'
import { buildGenerationsCards, GENERATIONS_SET_ID } from './generations'
import type { PokemonCard } from './pokemon'
import { buildShinyVaultCards, SHINY_VAULT_COMPANIONS } from './shiny-vault'
import {
  buildTrainerGalleryCards,
  TRAINER_GALLERY_COMPANIONS,
} from './trainer-gallery'

export interface SpecialPackBuilder {
  companionSetId?: string
  build(
    main: PokemonCard[],
    companion: PokemonCard[],
    size: number,
    boostHit?: boolean,
  ): PokemonCard[]
}

type CompanionBuild = SpecialPackBuilder['build']

function withCompanions(
  companions: Record<string, string>,
  build: CompanionBuild,
): Record<string, SpecialPackBuilder> {
  return Object.fromEntries(
    Object.entries(companions).map(([setId, companionSetId]) => [
      setId,
      { companionSetId, build },
    ]),
  )
}

const SPECIAL_PACK_BUILDERS: Record<string, SpecialPackBuilder> = {
  [CELEBRATION_30TH_SET_ID]: {
    companionSetId: CLASSIC_COLLECTION_SET_ID,
    build: buildCelebration30thCards,
  },
  [CROWN_ZENITH_SET_ID]: {
    companionSetId: GALARIAN_GALLERY_SET_ID,
    build: buildCrownZenithCards,
  },
  [GENERATIONS_SET_ID]: {
    build: (main, _companion, size, boostHit) =>
      buildGenerationsCards(main, size, boostHit),
  },
  [CELEBRATIONS_SET_ID]: {
    companionSetId: CELEBRATIONS_CLASSIC_SET_ID,
    build: buildCelebrationsCards,
  },
  ...withCompanions(SHINY_VAULT_COMPANIONS, buildShinyVaultCards),
  ...withCompanions(TRAINER_GALLERY_COMPANIONS, buildTrainerGalleryCards),
}

export function specialPackBuilder(
  setId: string,
): SpecialPackBuilder | undefined {
  return Object.hasOwn(SPECIAL_PACK_BUILDERS, setId)
    ? SPECIAL_PACK_BUILDERS[setId]
    : undefined
}
