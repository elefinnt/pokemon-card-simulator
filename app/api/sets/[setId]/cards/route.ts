import { NextResponse } from 'next/server'
import { jsonError, upstreamError } from '@/lib/api-route'
import { ensurePacksLoaded, getPack } from '@/lib/packs'
import { getSetCatalogue } from '@/lib/pokemon'

export const dynamic = 'force-dynamic'

/** Card catalogue for a set - powers the collection binder grid. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  const { setId } = await params

  await ensurePacksLoaded()
  if (!getPack(setId)) return jsonError('Unknown pack', 404)

  try {
    const cards = await getSetCatalogue(setId)
    return NextResponse.json({ setId, cards }, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' },
    })
  } catch (err) {
    return upstreamError(err, {
      label: '[sets/cards] fetch',
      fallback: 'Failed to load set cards.',
    })
  }
}
