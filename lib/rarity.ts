import type { CardTier } from './pokemon'

export interface TierMeta {
  label: string
  /** hex used for glows, borders and accents */
  color: string
  /** tailwind text class for the badge label */
  badgeClass: string
}

export const TIER_META: Record<CardTier, TierMeta> = {
  common: {
    label: 'Common',
    color: '#94a3b8',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
  },
  uncommon: {
    label: 'Uncommon',
    color: '#4ade80',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  },
  rare: {
    label: 'Rare',
    color: '#60a5fa',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  },
  ultra: {
    label: 'Ultra Rare',
    color: '#fbbf24',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
  },
}

export function isHit(tier: CardTier): boolean {
  return tier === 'rare' || tier === 'ultra'
}
