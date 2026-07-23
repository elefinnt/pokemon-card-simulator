import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/** Shared layout for text-led pages (FAQ, About, guides): a centred column
 *  with an eyebrow, heading and optional intro paragraphs. */
export function ContentPage({
  eyebrow,
  title,
  intro,
  children,
  backHref = '/',
  backLabel = 'Back to packs',
}: {
  eyebrow?: string
  title: string
  intro?: string[]
  children: React.ReactNode
  backHref?: string
  backLabel?: string
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-4" />
        {backLabel}
      </Link>

      <header className="mt-8">
        {eyebrow && (
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 text-balance font-display text-4xl font-black leading-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        {intro?.map((paragraph) => (
          <p key={paragraph} className="mt-4 text-pretty text-muted-foreground">
            {paragraph}
          </p>
        ))}
      </header>

      <div className="mt-10">{children}</div>
    </div>
  )
}
