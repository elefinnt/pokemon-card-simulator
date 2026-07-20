import { CardConditionDemo } from '@/components/card-condition-demo'
import { SiteHeader } from '@/components/site-header'

export const metadata = {
  title: 'Condition demo — PackRip',
  description: 'Preview PSA grade wear overlays driven by a CS:GO-style float value.',
}

export default function ConditionDemoPage() {
  return (
    <main className="relative min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]"
        style={{
          background:
            'radial-gradient(circle at 50% -10%, color-mix(in oklab, var(--primary) 25%, transparent), transparent 60%)',
        }}
      />
      <SiteHeader />
      <CardConditionDemo />
    </main>
  )
}
