import { NextResponse } from 'next/server'
import { openPack } from '@/lib/pokemon'
import { getPack } from '@/lib/packs'

// Each open produces a fresh randomized pack.
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  const { setId } = await params

  if (!getPack(setId)) {
    return NextResponse.json({ error: 'Unknown pack' }, { status: 404 })
  }

  try {
    const pack = await openPack(setId)
    return NextResponse.json(pack)
  } catch (err) {
    console.log('[v0] openPack failed:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Failed to open pack. Please try again.' },
      { status: 502 },
    )
  }
}
