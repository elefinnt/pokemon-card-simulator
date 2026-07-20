import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const alt = 'PackRip — Pokémon booster pack opening simulator'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  const ogArt = await readFile(join(process.cwd(), 'public/og.png'))
  const ogSrc = `data:image/png;base64,${ogArt.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ogSrc} alt="" width={1200} height={630} />
      </div>
    ),
    { ...size },
  )
}
