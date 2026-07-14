'use client'

import { useEffect, useState } from 'react'
import type { PokemonCard } from '@/lib/pokemon'

export function useSetCatalogue(setId: string) {
  const [cards, setCards] = useState<PokemonCard[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setCards(null)
    setError(false)

    fetch(`/api/sets/${setId}/cards`)
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`)
        return res.json() as Promise<{ cards: PokemonCard[] }>
      })
      .then((data) => {
        if (!cancelled) setCards(data.cards)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [setId])

  return { cards, loading: cards === null && !error, error }
}
