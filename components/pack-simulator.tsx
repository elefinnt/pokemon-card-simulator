'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import posthog from 'posthog-js'
import { findPackBySlug, type PackDef } from '@/lib/packs'
import { packPath, packSlugFromPath, pathForView, viewForPath } from '@/lib/nav'
import type { OpenedPack } from '@/lib/pokemon'
import { useCollection } from '@/lib/collection'
import { useFreePacks, recordFreePackOpened } from '@/lib/free-packs'
import { useTrades } from '@/lib/trades'
import { PackPicker } from './pack-picker'
import { BoosterPack } from './booster-pack'
import { CardReveal } from './card-reveal'
import { PulledCardsGrid } from './pulled-cards-grid'
import { CollectionView } from './collection-view'
import { CollectionStatus } from './collection-status'
import { CommunityFeed } from './community/community-feed'
import { FriendsView } from './friends/friends-view'
import { SignInPrompt } from './sign-in-prompt'
import { FreePacksIndicator } from './free-packs-indicator'
import { ViewTabs, type View } from './view-tabs'
import { Button } from '@/components/ui/button'
import { playSound, primeAudio } from '@/lib/sounds'

type Stage = 'select' | 'sealed' | 'revealing' | 'summary'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Parse an /api/open response, surfacing the server's error message. */
async function readOpenedPack(res: Response): Promise<OpenedPack> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `status ${res.status}`)
  }
  return (await res.json()) as OpenedPack
}

export function PackSimulator({
  packs,
  initialPack = null,
  initialView = 'packs',
}: {
  packs: PackDef[]
  /** Pre-selected pack when the visitor lands on a /pack/[slug] page. */
  initialPack?: PackDef | null
  /** Active tab when the visitor lands on a tab route like /community. */
  initialView?: View
}) {
  const [view, setView] = useState<View>(initialView)
  const [stage, setStage] = useState<Stage>(initialPack ? 'sealed' : 'select')
  const [pack, setPack] = useState<PackDef | null>(initialPack)
  const [opened, setOpened] = useState<OpenedPack | null>(null)
  const [ripping, setRipping] = useState(false)
  const [prefetching, setPrefetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastBoosted, setLastBoosted] = useState(false)
  const { data: collection, record, reset, isAuthenticated } = useCollection()
  const { status: authStatus } = useSession()
  const free = useFreePacks()
  const { data: trades } = useTrades()
  const pathname = usePathname()

  // Latest state snapshot for the URL-sync effect, so it can depend on the
  // pathname alone and only fire on actual navigations.
  const stateRef = useRef({ pack, stage })
  stateRef.current = { pack, stage }

  /** Push a new URL without a server round-trip. Next.js picks this up and
   *  PostHog records it as a $pageview, giving us journey tracking for free. */
  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path)
    }
  }, [])

  // Keep component state in sync with the URL (browser back/forward).
  useEffect(() => {
    const current = stateRef.current
    const slug = packSlugFromPath(pathname)
    if (slug) {
      const target = findPackBySlug(packs, slug)
      if (!target) return
      if (current.pack?.slug !== target.slug || current.stage === 'select') {
        setPack(target)
        setOpened(null)
        setError(null)
        setStage('sealed')
      }
    } else {
      if (current.stage !== 'select') {
        setStage('select')
        setOpened(null)
      }
      setView(viewForPath(pathname))
    }
  }, [pathname, packs])

  useEffect(() => {
    if (authStatus === 'unauthenticated' && view === 'friends') {
      setView('packs')
      window.history.replaceState(null, '', pathForView('packs'))
    }
  }, [authStatus, view])

  const changeView = useCallback(
    (v: View) => {
      posthog.capture('tab_changed', { tab: v })
      setView(v)
      navigate(pathForView(v))
    },
    [navigate],
  )

  const backToSelect = useCallback(() => {
    setStage('select')
    setOpened(null)
    navigate(pathForView(view))
  }, [navigate, view])

  const selectPack = useCallback(
    (p: PackDef) => {
      posthog.capture('pack_selected', {
        set_id: p.id,
        pack_slug: p.slug,
        pack_name: p.name,
        series: p.series,
      })
      setPack(p)
      setOpened(null)
      setError(null)
      setStage('sealed')
      navigate(packPath(p.slug))
    },
    [navigate],
  )

  // Warm the card pool as soon as a pack is selected (hover on the tile may
  // already have started this). Runs for guests too so it's ready the moment
  // they sign in and rip.
  useEffect(() => {
    if (!pack || stage !== 'sealed') return
    let cancelled = false
    setPrefetching(true)
    fetch(`/api/pool/${pack.id}`)
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setPrefetching(false)
      })
    return () => {
      cancelled = true
    }
  }, [pack, stage])

  const rip = useCallback(async () => {
    if (!pack || ripping) return
    // Guests rip from a free allowance; once it's spent they must sign in.
    if (!isAuthenticated && free.exhausted) return
    primeAudio()
    setRipping(true)
    setError(null)
    const started = Date.now()
    // The final free pack rolls with boosted odds to reward signing in.
    const boosted = !isAuthenticated && free.isLastFree
    try {
      const res = isAuthenticated
        ? await fetch(`/api/open/${pack.id}`, { method: 'POST' })
        : await fetch(`/api/open/${pack.id}${boosted ? '?boost=1' : ''}`)
      const data = await readOpenedPack(res)
      await delay(Math.max(0, 1200 - (Date.now() - started)))
      // Signed-in analytics are captured server-side as `pack_opened`; guests
      // are tracked here since their opens never hit the authenticated route.
      record(data)
      if (!isAuthenticated) {
        recordFreePackOpened()
        posthog.capture('guest_pack_opened', {
          set_id: pack.id,
          pack_name: pack.name,
          boosted,
          best_tier: data.bestTier,
          free_packs_used: free.used + 1,
        })
      }
      setLastBoosted(boosted)
      setOpened(data)
      setStage('revealing')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not reach the card server.'
      console.log('[rip] failed:', message)
      setError(message)
    } finally {
      setRipping(false)
    }
  }, [
    pack,
    ripping,
    record,
    isAuthenticated,
    free.exhausted,
    free.isLastFree,
    free.used,
  ])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20">
      {stage === 'select' && (
        <section>
          <div className="mx-auto max-w-2xl pt-10 text-center sm:pt-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Pack Opening Simulator
            </span>
            <h1 className="mt-4 text-balance font-display text-4xl font-black leading-tight text-foreground sm:text-5xl">
              Rip open a <span className="text-primary">Pokémon</span> booster
            </h1>
            <p className="mt-3 text-pretty text-muted-foreground">
              Pick a pack, tear it open, and reveal every card one by one. Chase
              the holos and hit that Ultra Rare.
            </p>
            <CollectionStatus />
          </div>

          <div className="mt-8 flex justify-center">
            <ViewTabs
              view={view}
              onChange={changeView}
              isAuthenticated={isAuthenticated}
              badges={{ friends: trades.incomingCount }}
            />
          </div>

          {view === 'packs' && (
            <div className="mt-8">
              <PackPicker
                packs={packs}
                collection={collection}
                onSelect={selectPack}
                requiresSignIn={!isAuthenticated && free.exhausted}
              />
            </div>
          )}

          {view === 'collection' && (
            <div className="mt-8">
              <CollectionView
                packs={packs}
                collection={collection}
                onOpenPack={selectPack}
                onReset={reset}
                requiresSignIn={!isAuthenticated && free.exhausted}
              />
            </div>
          )}

          {view === 'community' && (
            <div className="mt-8">
              <CommunityFeed
                isAuthenticated={isAuthenticated}
                onAddFriends={
                  isAuthenticated ? () => setView('friends') : undefined
                }
              />
            </div>
          )}

          {view === 'friends' && (
            <div className="mt-8">
              <FriendsView requiresSignIn={!isAuthenticated} />
            </div>
          )}
        </section>
      )}

      {stage === 'sealed' && pack && (
        <section className="flex flex-col items-center pt-8">
          <div className="mb-8 w-full">
            <Button
              variant="ghost"
              onClick={backToSelect}
              className="text-muted-foreground"
            >
              <ArrowLeft className="size-4" />
              All packs
            </Button>
          </div>

          <div className="mb-8 text-center">
            <h1 className="font-display text-2xl font-extrabold text-foreground">
              {pack.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {pack.series} Series · {pack.year}
            </p>
            {prefetching && (
              <p className="mt-1 text-xs text-muted-foreground">
                Loading card pool…
              </p>
            )}
          </div>

          <div className="flex min-h-[26rem] flex-col items-center gap-6">
            <BoosterPack
              pack={pack}
              ripping={ripping}
              locked={!isAuthenticated && free.exhausted}
              onOpen={rip}
            />
            {!isAuthenticated && !free.exhausted && (
              <FreePacksIndicator state={free} />
            )}
            {!isAuthenticated && free.exhausted && (
              <SignInPrompt
                variant="compact"
                description="That was your last free pack. Sign in free for unlimited packs — and keep the cards you've pulled."
              />
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-foreground">
              <AlertCircle className="size-4 text-primary" />
              {error}
            </div>
          )}
        </section>
      )}

      {stage === 'revealing' && pack && opened && (
        <section className="flex flex-col items-center pt-10">
          <CardReveal
            cards={opened.cards}
            pack={pack}
            packType={opened.packType}
            onDone={() => setStage('summary')}
          />
        </section>
      )}

      {stage === 'summary' && pack && opened && (
        <section className="pt-10">
          <PulledCardsGrid
            cards={opened.cards}
            pack={pack}
            bestTier={opened.bestTier}
            packType={opened.packType}
            guestGate={
              isAuthenticated
                ? undefined
                : {
                    remaining: free.remaining,
                    exhausted: free.exhausted,
                    boosted: lastBoosted,
                  }
            }
            onOpenAnother={() => {
              setOpened(null)
              setStage('sealed')
            }}
            onChangePack={backToSelect}
          />
        </section>
      )}
    </div>
  )
}
