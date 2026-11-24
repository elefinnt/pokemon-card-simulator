import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Jersey_10, Press_Start_2P, Rubik } from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
import { StructuredData } from '@/components/structured-data'
import { applicationSchema } from '@/lib/site-discovery'
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

const pressStart = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-press-start',
  preload: false,
})

const jersey = Jersey_10({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-jersey',
  preload: false,
})

const themeScript =
  "try{var t=localStorage.getItem('packrip-theme');if(t==='gen1'||t==='gen3')document.documentElement.dataset.theme=t}catch(e){}"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packrip.org'

const title = 'PackRip — Free Pokémon Pack Opening Simulator | Rip Packs Online'
const description =
  'Rip Pokémon booster packs online for free with PackRip, the pack rip simulator. Open classic and modern sets, reveal holo pulls with sparkle and shine, and track your collection.'

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
  viewportFit: 'cover',
}

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'PackRip',
      url: siteUrl,
      description,
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: 'PackRip',
      url: siteUrl,
      description,
    },
    applicationSchema(),
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
      className={`${inter.variable} ${rubik.variable} ${pressStart.variable} ${jersey.variable} bg-background`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <StructuredData data={siteJsonLd} />
        <AuthProvider>{children}</AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
