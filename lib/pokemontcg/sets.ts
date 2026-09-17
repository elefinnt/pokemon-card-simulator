import { apiGet } from './client'
import { cached } from './cache'
import type { ApiListResponse, RawSet } from './types'

const SET_FIELDS = 'id,name,series,total,printedTotal,releaseDate,images'

/** Keep each `/sets` query short. A single OR of the full catalogue 502s. */
const SET_QUERY_CHUNK = 20

async function fetchSetChunk(ids: string[]): Promise<RawSet[]> {
  const q = ids.map((id) => `id:${id}`).join(' OR ')
  try {
    const res = await apiGet<ApiListResponse<RawSet>>('/sets', {
      q,
      pageSize: Math.min(ids.length, 250),
      select: SET_FIELDS,
    })
    return res.data
  } catch (err) {
    console.warn(
      '[sets] chunk failed, skipping',
      ids.join(','),
      err instanceof Error ? err.message : err,
    )
    return []
  }
}

async function fetchSetsByIds(ids: string[]): Promise<RawSet[]> {
  if (ids.length === 0) return []

  const chunks: string[][] = []
  for (let i = 0; i < ids.length; i += SET_QUERY_CHUNK) {
    chunks.push(ids.slice(i, i + SET_QUERY_CHUNK))
  }

  const pages = await Promise.all(chunks.map(fetchSetChunk))
  const byId = new Map(pages.flat().map((set) => [set.id, set]))
  return ids
    .map((id) => byId.get(id))
    .filter((set): set is RawSet => set !== undefined)
}

/** Fetch metadata for a batch of set ids (cached for 24 h). */
export function getSetsByIds(ids: string[]): Promise<RawSet[]> {
  const key = `sets:${ids.join(',')}`
  return cached(key, () => fetchSetsByIds(ids))
}

/** Fetch a single set by id. */
export function getSetById(setId: string): Promise<RawSet | undefined> {
  return cached(`set:${setId}`, async () => {
    const res = await apiGet<{ data: RawSet }>(`/sets/${setId}`, {
      select: SET_FIELDS,
    })
    return res.data
  })
}
