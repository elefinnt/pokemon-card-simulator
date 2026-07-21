import { ImageResponse } from 'next/og'
import { ensurePacksLoaded, findPackBySlug } from '@/lib/packs'

export const alt = 'PackRip — Pokémon booster pack opening simulator'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Fetch the set logo and inline it, so the OG image renders self-contained. */
async function logoDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    return `data:image/png;base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const packs = await ensurePacksLoaded()
  const pack = findPackBySlug(packs, slug)
  if (!pack) return new Response('Not found', { status: 404 })

  const logo = await logoDataUri(pack.logo)

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          gap: 28,
          background: `linear-gradient(150deg, ${pack.accentFrom}, ${pack.accentTo})`,
          fontFamily: 'sans-serif',
        }}
      >
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt=""
            style={{ maxHeight: 260, maxWidth: 700, objectFit: 'contain' }}
          />
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: logo ? 44 : 72,
              fontWeight: 800,
              color: '#ffffff',
              textShadow: '0 4px 18px rgba(0,0,0,0.55)',
            }}
          >
            {`${pack.name} Pack Simulator`}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            {`${pack.series} Series · ${pack.year} — open packs free on PackRip`}
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
