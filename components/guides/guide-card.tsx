import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Guide } from '@/lib/guides'

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {guide.readingMinutes} min read
      </p>
      <h2 className="mt-2 font-display text-xl font-extrabold leading-tight text-card-foreground">
        {guide.title}
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {guide.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Read guide
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
