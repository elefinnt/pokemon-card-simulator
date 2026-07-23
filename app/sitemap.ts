import type { MetadataRoute } from 'next'
import { CURATED_SET_IDS, PACK_OVERRIDES } from '@/lib/pack-overrides'
import { GUIDES } from '@/lib/guides'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packrip.org'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const packPages: MetadataRoute.Sitemap = CURATED_SET_IDS.map((id) => ({
    url: `${siteUrl}/pack/${PACK_OVERRIDES[id].slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const guidePages: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: `${siteUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.updated),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/guides`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/community`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.6,
    },
    ...guidePages,
    ...packPages,
  ]
}
