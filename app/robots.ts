import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packrip.org'

export default function robots(): MetadataRoute.Robots {
  const publicPages = {
    allow: '/',
    disallow: ['/api/', '/profile', '/collection', '/friends'],
  }
  return {
    rules: [
      {
        userAgent: '*',
        ...publicPages,
      },
      {
        // Search access is separate from model-training crawler preferences.
        userAgent: ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot'],
        ...publicPages,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
