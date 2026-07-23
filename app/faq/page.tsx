import type { Metadata } from 'next'
import { FAQ_ITEMS } from '@/lib/faq'
import { PageShell } from '@/components/page-shell'
import { ContentPage } from '@/components/content/content-page'
import { FaqList } from '@/components/faq/faq-list'
import { StructuredData } from '@/components/structured-data'

const title = 'Frequently Asked Questions — PackRip'
const description =
  'Answers to common questions about PackRip: is it free, do you need an account, are the pull rates realistic, and which Pokémon sets you can open.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/faq' },
  openGraph: {
    title,
    description,
    url: '/faq',
    siteName: 'PackRip',
    locale: 'en_GB',
    type: 'website',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

export default function FaqPage() {
  return (
    <PageShell>
      <StructuredData data={faqJsonLd} />
      <ContentPage
        eyebrow="Help"
        title="Frequently asked questions"
        intro={[
          'Everything you need to know about opening Pokémon booster packs on PackRip.',
        ]}
      >
        <FaqList items={FAQ_ITEMS} />
      </ContentPage>
    </PageShell>
  )
}
