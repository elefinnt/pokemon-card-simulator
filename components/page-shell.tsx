import { SiteHeader } from '@/components/site-header'

/** Shared page chrome: glow backdrop plus the site header. */
export function PageShell({ children }: { children: React.ReactNode }) {
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

      {children}
    </main>
  )
}
