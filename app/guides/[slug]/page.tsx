import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GUIDES, findGuideBySlug } from '@/lib/guides'
import { PageShell } from '@/components/page-shell'
import { ContentPage } from '@/components/content/content-page'
import { GuideArticle } from '@/components/guides/guide-article'
import { StructuredData } from '@/components/structured-data'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packrip.org'

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = findGuideBySlug(slug)
  if (!guide) return { title: 'Guide not found · PackRip' }

  const title = `${guide.title} — PackRip`
  return {
    title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title,
      description: guide.description,
      url: `/guides/${guide.slug}`,
      siteName: 'PackRip',
      locale: 'en_GB',
      type: 'article',
    },
  }
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const guide = findGuideBySlug(slug)
  if (!guide) notFound()

  const url = `${siteUrl}/guides/${guide.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guide.title,
        description: guide.description,
        dateModified: guide.updated,
        url,
        isPartOf: { '@type': 'WebSite', name: 'PackRip', url: siteUrl },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Guides',
            item: `${siteUrl}/guides`,
          },
          { '@type': 'ListItem', position: 2, name: guide.title, item: url },
        ],
      },
    ],
  }

  return (
    <PageShell>
      <StructuredData data={jsonLd} />
      <ContentPage
        eyebrow={`${guide.readingMinutes} min read`}
        title={guide.title}
        intro={guide.intro}
        backHref="/guides"
        backLabel="All guides"
      >
        <GuideArticle guide={guide} />
      </ContentPage>
    </PageShell>
  )
}
