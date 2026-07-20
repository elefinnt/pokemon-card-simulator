import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const alt = 'PackRip — Pokémon booster pack opening simulator'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const PRIMARY = '#e8544a'
const FOREGROUND = '#f4f4f5'
const MUTED = '#a1a1aa'
const BACKGROUND = '#1a1d2b'

async function loadFont(weight: 700 | 900) {
  const url =
    weight === 900
      ? 'https://fonts.gstatic.com/s/rubik/v31/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-ro-1UA.ttf'
      : 'https://fonts.gstatic.com/s/rubik/v31/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-4I-1UA.ttf'
  return fetch(url).then((res) => res.arrayBuffer())
}

export default async function OpenGraphImage() {
  const [rubikBold, rubikBlack, ogArt] = await Promise.all([
    loadFont(700),
    loadFont(900),
    readFile(join(process.cwd(), 'public/og.png')),
  ])

  const ogSrc = `data:image/png;base64,${ogArt.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: BACKGROUND,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: 80,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${PRIMARY}44 0%, transparent 70%)`,
          }}
        />

        {/* Pack artwork only — clip off the baked-in text on the left */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 600,
            height: '100%',
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ogSrc}
            alt=""
            width={1200}
            height={630}
            style={{ marginLeft: -640 }}
          />
        </div>

        {/* Blend packs into the text panel */}
        <div
          style={{
            position: 'absolute',
            right: 520,
            top: 0,
            width: 180,
            height: '100%',
            background: `linear-gradient(90deg, ${BACKGROUND} 0%, transparent 100%)`,
          }}
        />

        {/* Copy — rendered above the artwork layers */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 72px',
            width: 560,
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 36,
            }}
          >
            <svg viewBox="0 0 100 100" width="44" height="44">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="#fff"
                stroke="#111"
                strokeWidth="4"
              />
              <path
                d="M4 50a46 46 0 0 1 92 0Z"
                fill={PRIMARY}
                stroke="#111"
                strokeWidth="4"
              />
              <line
                x1="4"
                y1="50"
                x2="96"
                y2="50"
                stroke="#111"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="15"
                fill="#fff"
                stroke="#111"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="6"
                fill="#fff"
                stroke="#111"
                strokeWidth="3"
              />
            </svg>
            <span
              style={{
                fontFamily: 'Rubik',
                fontSize: 34,
                fontWeight: 900,
                color: FOREGROUND,
                letterSpacing: '-0.02em',
              }}
            >
              PackRip
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Rubik',
              fontSize: 58,
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              color: FOREGROUND,
            }}
          >
            <span>Rip open a</span>
            <span style={{ color: PRIMARY }}>Pokémon</span>
            <span>Booster</span>
          </div>

          <p
            style={{
              marginTop: 24,
              maxWidth: 520,
              fontFamily: 'Rubik',
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1.4,
              color: MUTED,
            }}
          >
            Classic and modern booster packs — chase the holos.
          </p>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Rubik', data: rubikBold, weight: 700, style: 'normal' },
        { name: 'Rubik', data: rubikBlack, weight: 900, style: 'normal' },
      ],
    },
  )
}
