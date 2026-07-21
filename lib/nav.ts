import type { View } from '@/components/view-tabs'

/**
 * Route helpers for the simulator's URL-driven navigation.
 *
 * Every top-level view and every pack has its own path so that PostHog
 * pageviews capture the full user journey and search engines can index
 * each pack page individually.
 */

const VIEW_PATHS: Record<View, string> = {
  packs: '/',
  collection: '/collection',
  community: '/community',
  friends: '/friends',
}

export function pathForView(view: View): string {
  return VIEW_PATHS[view]
}

export function viewForPath(pathname: string): View {
  const entry = (Object.entries(VIEW_PATHS) as [View, string][]).find(
    ([, path]) => path === pathname,
  )
  return entry?.[0] ?? 'packs'
}

export function packPath(slug: string): string {
  return `/pack/${slug}`
}

/** Extract the pack slug from a pathname, or null if it isn't a pack page. */
export function packSlugFromPath(pathname: string): string | null {
  const match = /^\/pack\/([^/]+)\/?$/.exec(pathname)
  return match ? decodeURIComponent(match[1]) : null
}
