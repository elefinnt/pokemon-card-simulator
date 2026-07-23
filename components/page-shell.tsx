import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

/** Shared page chrome: glow backdrop, site header and footer. */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
        style={{
          background:
            'radial-gradient(circle at 50% -10%, color-mix(in oklab, var(--primary) 30%, transparent), transparent 60%)',
        }}
      />

      <SiteHeader />

      <main className="flex-1">{children}</main>

      <SiteFooter />
    </div>
  )
}
