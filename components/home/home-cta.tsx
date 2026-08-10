'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowRight, Cloud, LogIn, Sparkles, Users } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { openSignIn } from '@/lib/sign-in-dialog'
import { useCollection } from '@/lib/collection'
import { getSiteStats, roundDownTo } from '@/lib/site-stats'

/**
 * Auth-aware homepage section shown between the simulator and the FAQ.
 * Guests get a social-proof call to action with live counters; signed-in
 * visitors get a slim personalised welcome-back band instead.
 */
export function HomeCta() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // The simulator swaps to /pack/[slug] via pushState without a server
  // round-trip, so this component stays mounted — hide it off the homepage.
  if (pathname !== '/') return null
  if (status === 'loading') return null

  if (status === 'authenticated') {
    return <WelcomeBack name={session?.user?.name ?? null} />
  }
  return <GuestCta />
}

// ---- Guest call to action ---------------------------------------------------

const BENEFITS = [
  { icon: Sparkles, label: 'Unlimited packs, free forever' },
  { icon: Cloud, label: 'Your collection saved across devices' },
  { icon: Users, label: 'Trade pulls with friends' },
] as const

function GuestCta() {
  const [stats, setStats] = useState(() => getSiteStats())
  const { ref, inView } = useInView()

  // Tick the counters from the clock so "packs opened" visibly climbs while
  // the visitor is reading.
  useEffect(() => {
    if (!inView) return
    const id = setInterval(() => setStats(getSiteStats()), 1000)
    return () => clearInterval(id)
  }, [inView])

  const collectors = roundDownTo(stats.collectors, 100)

  return (
    <section ref={ref} className="mx-auto w-full max-w-4xl px-4 pb-8 pt-4">
      <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-card px-6 py-10 text-center sm:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-40"
          style={{
            background:
              'radial-gradient(circle at 50% -40%, color-mix(in oklab, var(--primary) 25%, transparent), transparent 70%)',
          }}
        />

        <h2 className="relative text-balance font-display text-3xl font-black text-foreground sm:text-4xl">
          Join {collectors.toLocaleString('en-GB')}+ collectors ripping packs
          every day
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
          Free forever — no purchases, no gambling. Sign in and every card you
          pull is saved to a collection you can build, show off and trade.
        </p>

        <dl className="relative mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile
            label="Packs ripped to date"
            value={stats.packsOpened}
            inView={inView}
          />
          <StatTile
            label="Cards pulled"
            value={stats.cardsPulled}
            inView={inView}
          />
          <StatTile
            label="Collectors signed up"
            value={stats.collectors}
            inView={inView}
          />
        </dl>

        <div className="relative mt-8 flex flex-col items-center gap-3">
          <Button onClick={openSignIn} size="lg" className="px-6 font-semibold">
            <LogIn className="size-4" />
            Sign in free
          </Button>
          <p className="text-xs text-muted-foreground">
            Takes seconds with Google, Discord or email.
          </p>
        </div>

        <ul className="relative mx-auto mt-8 flex max-w-2xl flex-col items-center justify-center gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-6">
          {BENEFITS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="size-4 text-primary" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function StatTile({
  label,
  value,
  inView,
}: {
  label: string
  value: number
  inView: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 px-4 py-5">
      <dd className="font-display text-2xl font-black tabular-nums text-foreground sm:text-3xl">
        <AnimatedNumber value={value} start={inView} />
      </dd>
      <dt className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
    </div>
  )
}

/** Counts up from zero the first time it becomes visible, then mirrors the
 *  live value so the clock-driven counters keep climbing afterwards. */
function AnimatedNumber({ value, start }: { value: number; start: boolean }) {
  const [display, setDisplay] = useState(0)
  const [settled, setSettled] = useState(false)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!start || startedRef.current) return
    startedRef.current = true

    const target = value
    const duration = 1400
    const t0 = performance.now()
    let raf = 0

    const tick = (t: number) => {
      const progress = Math.min(1, (t - t0) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(target * eased))
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setSettled(true)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, value])

  return <>{(settled ? value : display).toLocaleString('en-GB')}</>
}

/** Observe the section once so the count-up starts as it scrolls into view. */
function useInView() {
  const ref = useRef<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, inView }
}

// ---- Signed-in welcome band -------------------------------------------------

function WelcomeBack({ name }: { name: string | null }) {
  const { data } = useCollection()
  const firstName = name?.trim().split(/\s+/)[0]
  const uniqueCards = Object.keys(data.cards).length
  const hasRipped = data.totalPacksOpened > 0

  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-8 pt-4">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-5 text-center sm:flex-row sm:text-left">
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-extrabold text-foreground">
            Welcome back{firstName ? `, ${firstName}` : ''}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasRipped ? (
              <>
                You&apos;ve ripped{' '}
                <span className="font-semibold text-foreground">
                  {data.totalPacksOpened.toLocaleString('en-GB')}
                </span>{' '}
                {data.totalPacksOpened === 1 ? 'pack' : 'packs'} and collected{' '}
                <span className="font-semibold text-foreground">
                  {uniqueCards.toLocaleString('en-GB')}
                </span>{' '}
                unique {uniqueCards === 1 ? 'card' : 'cards'} so far.
              </>
            ) : (
              <>Your binder is empty — rip your first pack to get started.</>
            )}
          </p>
        </div>
        {hasRipped && (
          <Link
            href="/collection"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'shrink-0 font-semibold',
            )}
          >
            View your collection
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </section>
  )
}
