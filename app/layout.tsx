import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Rubik } from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
import { StructuredData } from '@/components/structured-data'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-rubik',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packrip.org'

const title = 'PackRip — Pokémon Card Pack Opening Simulator'
const description =
  'Rip open classic and modern Pokémon booster packs and reveal your pulls with holo shine, sparkles, and rare-hit celebrations.'

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: 'PackRip',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1a1d2b',
}

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'PackRip',
      url: siteUrl,
      description,
    },
    {
      '@type': 'WebSite',
      name: 'PackRip',
      url: siteUrl,
      description,
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${rubik.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <StructuredData data={siteJsonLd} />
        <AuthProvider>{children}</AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
