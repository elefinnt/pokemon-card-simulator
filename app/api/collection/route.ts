import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  getUserCollection,
  importUserCollection,
  resetUserCollection,
} from '@/lib/collection-db'
import {
  isValidCollectionData,
} from '@/lib/collection-merge'
import type { CollectionData } from '@/lib/collection-types'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const collection = await getUserCollection(session.user.id)
    return NextResponse.json(collection)
  } catch (err) {
    console.log('[collection] GET failed:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Failed to load collection' },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    await resetUserCollection(session.user.id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.log('[collection] DELETE failed:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Failed to reset collection' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!isValidCollectionData(body)) {
    return NextResponse.json({ error: 'Invalid collection data' }, { status: 400 })
  }

  try {
    const collection = await importUserCollection(
      session.user.id,
      body as CollectionData,
    )
    return NextResponse.json(collection)
  } catch (err) {
    console.log('[collection] POST failed:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Failed to import collection' },
      { status: 500 },
    )
  }
}
