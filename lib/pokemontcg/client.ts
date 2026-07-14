/**
 * Thin server-side client for the Pokémon TCG API v2.
 *
 * Responsibilities:
 *  - attach the API key (when configured) so we get the higher rate limit
 *  - apply a per-attempt timeout and retry transient failures
 *  - surface rate limiting (429) distinctly from other server errors
 *
 * This must only ever run on the server so the API key is never exposed.
 */

const API_BASE = 'https://api.pokemontcg.io/v2'
const DEFAULT_TIMEOUT_MS = 8000
const MAX_ATTEMPTS = 3
/** Card and set data is static per set, so cache for a day by default. */
const DEFAULT_REVALIDATE_SECONDS = 86400
const PLACEHOLDER_KEY = 'your_key_here'

/** Thrown when the API responds with 429 Too Many Requests. */
export class RateLimitError extends Error {
  constructor(message = 'Pokémon TCG API rate limit exceeded') {
    super(message)
    this.name = 'RateLimitError'
  }
}

/** Thrown for any other non-OK response or unreachable API. */
export class PokemonTcgError extends Error {
  readonly status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'PokemonTcgError'
    this.status = status
  }
}

type QueryParams = Record<string, string | number | undefined>

function authHeaders(): Record<string, string> {
  const key = process.env.POKEMONTCG_API_KEY
  if (key && key !== PLACEHOLDER_KEY) {
    return { 'X-Api-Key': key }
  }
  return {}
}

function buildUrl(path: string, params: QueryParams): string {
  const url = new URL(`${API_BASE}${path}`)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

export interface ApiGetOptions {
  /** Per-attempt timeout in milliseconds. */
  timeoutMs?: number
  /** Next.js data-cache revalidation window, in seconds. */
  revalidateSeconds?: number
}

/** Perform a GET against the API, returning the parsed JSON body. */
export async function apiGet<T>(
  path: string,
  params: QueryParams = {},
  options: ApiGetOptions = {},
): Promise<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    revalidateSeconds = DEFAULT_REVALIDATE_SECONDS,
  } = options
  const url = buildUrl(path, params)

  let lastError: unknown
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        headers: authHeaders(),
        signal: AbortSignal.timeout(timeoutMs),
        next: { revalidate: revalidateSeconds },
      })

      // Rate limiting won't resolve by immediately retrying — bail out early.
      if (res.status === 429) {
        throw new RateLimitError()
      }
      if (!res.ok) {
        throw new PokemonTcgError(
          `Pokémon TCG API responded with ${res.status}`,
          res.status,
        )
      }

      return (await res.json()) as T
    } catch (err) {
      if (err instanceof RateLimitError) throw err
      lastError = err
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new PokemonTcgError('Failed to reach the Pokémon TCG API')
}
