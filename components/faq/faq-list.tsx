import type { FaqItem } from '@/lib/faq'

/** Accessible, crawlable FAQ list. Native <details> keeps the answers in the
 *  HTML (so search engines read them) while staying interactive without JS. */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-2xl border border-border bg-card px-5 py-4 transition-colors open:border-primary/50"
        >
          <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-lg font-bold text-card-foreground marker:content-none [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="shrink-0 text-2xl leading-none text-primary transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  )
}
