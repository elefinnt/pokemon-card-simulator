import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Rubik } from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
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

export const metadata: Metadata = {
  title: 'PackRip — Pokémon Card Pack Opening Simulator',
  description:
    'Rip open classic and modern Pokémon booster packs and reveal your pulls with holo shine, sparkles, and rare-hit celebrations.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1a1d2b',
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
        <AuthProvider>{children}</AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
