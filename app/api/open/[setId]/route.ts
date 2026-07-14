import { NextResponse } from 'next/server'
import { openPack } from '@/lib/pokemon'
import { ensurePacksLoaded, getPack } from '@/lib/packs'
import { RateLimitError } from '@/lib/pokemontcg/client'

// Each open produces a fresh randomized pack.
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  const { setId } = await params

  await ensurePacksLoaded()
  if (!getPack(setId)) {
    return NextResponse.json({ error: 'Unknown pack' }, { status: 404 })
  }

  try {
    const pack = await openPack(setId)
    return NextResponse.json(pack)
  } catch (err) {
    console.log('[open] failed:', err instanceof Error ? err.message : err)

    if (err instanceof RateLimitError) {
      return NextResponse.json(
        {
          error:
            'The card service is busy right now (rate limited). Please try again in a moment.',
        },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to open pack. Please try again.' },
      { status: 502 },
    )
  }
}
