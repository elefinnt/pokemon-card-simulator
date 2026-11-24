import { NextResponse } from 'next/server'
import {
  invalidJson,
  jsonError,
  readJson,
  routeError,
  sessionUserId,
  unauthorised,
} from '@/lib/api-route'
import {
  getUserCollection,
  importUserCollection,
  resetUserCollection,
} from '@/lib/collection-db'
import { isValidCollectionData } from '@/lib/collection-merge'
import type { CollectionData } from '@/lib/collection-types'

export async function GET() {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  try {
    const collection = await getUserCollection(userId)
    return NextResponse.json(collection)
  } catch (err) {
    return routeError(err, {
      label: '[collection] GET',
      fallback: 'Failed to load collection',
    })
  }
}

export async function DELETE() {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  try {
    await resetUserCollection(userId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return routeError(err, {
      label: '[collection] DELETE',
      fallback: 'Failed to reset collection',
    })
  }
}

export async function POST(request: Request) {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  const body = await readJson(request)
  if (body === undefined) return invalidJson()

  if (!isValidCollectionData(body)) {
    return jsonError('Invalid collection data', 400)
  }

  try {
    const collection = await importUserCollection(
      userId,
      body as CollectionData,
    )
    return NextResponse.json(collection)
  } catch (err) {
    return routeError(err, {
      label: '[collection] POST',
      fallback: 'Failed to import collection',
    })
  }
}
