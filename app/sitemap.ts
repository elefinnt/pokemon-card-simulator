import type { MetadataRoute } from 'next'
import { CURATED_SET_IDS, PACK_OVERRIDES } from '@/lib/pack-overrides'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packrip.org'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const packPages: MetadataRoute.Sitemap = CURATED_SET_IDS.map((id) => ({
    url: `${siteUrl}/pack/${PACK_OVERRIDES[id].slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/community`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.6,
    },
    ...packPages,
  ]
}
