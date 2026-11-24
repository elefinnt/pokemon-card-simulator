import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { RateLimitError } from './pokemontcg/client'

export function jsonError(
  error: string,
  status: number,
  init?: ResponseInit,
): NextResponse {
  return NextResponse.json({ error }, { ...init, status })
}

export function unauthorised(): NextResponse {
  return jsonError('Unauthorised', 401)
}

export async function sessionUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

/** Resolves to `undefined` when the body is not valid JSON. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}

export function invalidJson(): NextResponse {
  return jsonError('Invalid JSON', 400)
}

export function parseIntegerParam(raw: string): number | null {
  const value = Number(raw)
  return Number.isInteger(value) ? value : null
}

function logFailure(label: string, err: unknown) {
  console.log(`${label} failed:`, err instanceof Error ? err.message : err)
}

type StatusError = Error & { status: number }
type StatusErrorClass = abstract new (...args: never[]) => StatusError

interface RouteErrorOptions {
  label: string
  fallback: string
  /** Error classes whose message and status are sent to the client as-is. */
  expected?: StatusErrorClass[]
}

export function routeError(
  err: unknown,
  { label, fallback, expected = [] }: RouteErrorOptions,
): NextResponse {
  for (const ErrorClass of expected) {
    if (err instanceof ErrorClass) return jsonError(err.message, err.status)
  }
  logFailure(label, err)
  return jsonError(fallback, 500)
}

interface UpstreamErrorOptions {
  label: string
  fallback: string
  rateLimited?: string
}

export function upstreamError(
  err: unknown,
  {
    label,
    fallback,
    rateLimited = 'Rate limited. Please try again shortly.',
  }: UpstreamErrorOptions,
): NextResponse {
  logFailure(label, err)
  if (err instanceof RateLimitError) return jsonError(rateLimited, 429)
  return jsonError(fallback, 502)
}
