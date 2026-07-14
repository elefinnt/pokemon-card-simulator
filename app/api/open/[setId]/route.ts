import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { openPack } from '@/lib/pokemon'
import { ensurePacksLoaded, getPack } from '@/lib/packs'
import { RateLimitError } from '@/lib/pokemontcg/client'
import { recordPackForUser } from '@/lib/collection-db'

export const dynamic = 'force-dynamic'

async function openPackForSet(setId: string) {
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

/** Guest pack open — cards are saved client-side only. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  const { setId } = await params
  return openPackForSet(setId)
}

/** Signed-in pack open — cards are persisted to the account. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to open packs' }, { status: 401 })
  }

  const { setId } = await params

  await ensurePacksLoaded()
  if (!getPack(setId)) {
    return NextResponse.json({ error: 'Unknown pack' }, { status: 404 })
  }

  try {
    const pack = await openPack(setId)
    await recordPackForUser(session.user.id, pack)
    return NextResponse.json(pack)
  } catch (err) {
    console.log('[open] POST failed:', err instanceof Error ? err.message : err)

    if (err instanceof RateLimitError) {
      return NextResponse.json(
        {
          error:
            'The card service is busy right now (rate limited). Please try again in a moment.',
        },
        { status: 429 },
      )
    }

    if (err instanceof Error && err.message === 'DATABASE_URL is not configured') {
      return NextResponse.json(
        { error: 'Database is not configured' },
        { status: 503 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to open pack. Please try again.' },
      { status: 502 },
    )
  }
}
