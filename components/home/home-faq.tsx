import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FAQ_ITEMS } from '@/lib/faq'
import { FaqList } from '@/components/faq/faq-list'

/** Compact FAQ block for the homepage. Shows the top questions and links
 *  through to the full /faq page for the rest. */
export function HomeFaq() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-24 pt-4">
      <div className="text-center">
        <h2 className="font-display text-3xl font-black text-foreground">
          Common questions
        </h2>
        <p className="mt-2 text-muted-foreground">
          New to PackRip? Here are the essentials.
        </p>
      </div>

      <div className="mt-8">
        <FaqList items={FAQ_ITEMS.slice(0, 4)} />
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/faq"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          See all frequently asked questions
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}
