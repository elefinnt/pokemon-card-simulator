import type { Guide } from '@/lib/guides'

export function GuideArticle({ guide }: { guide: Guide }) {
  return (
    <article className="space-y-8 leading-relaxed text-muted-foreground">
      {guide.sections.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {section.heading}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
    </article>
  )
}
