import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Pokeball } from '@/components/poke-card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Page not found · PackRip',
}

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
        style={{
          background:
            'radial-gradient(circle at 50% -10%, color-mix(in oklab, var(--primary) 30%, transparent), transparent 60%)',
        }}
      />

      <SiteHeader />

      <section className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 pb-20 pt-16 text-center sm:pt-24">
        <div className="relative">
          <Pokeball className="h-20 w-20 animate-float-slow opacity-90 drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]" />
        </div>

        <p className="mt-8 font-display text-6xl font-black leading-none text-primary sm:text-7xl">
          404
        </p>
        <h1 className="mt-4 text-balance font-display text-3xl font-black leading-tight text-foreground sm:text-4xl">
          This card isn&apos;t in the binder
        </h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          The page you&apos;re after doesn&apos;t exist — it may have been moved,
          or the link was mistyped. Let&apos;s get you back to ripping packs.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className={cn(buttonVariants({ size: 'lg' }), 'font-semibold')}
          >
            <ArrowLeft className="size-4" />
            Back to the packs
          </Link>
        </div>
      </section>
    </main>
  )
}
