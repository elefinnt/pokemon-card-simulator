/**
 * Shared free-pack configuration. Kept in a plain (non-'use client') module so
 * the value can be read directly on the server — e.g. in FAQ/About copy — as
 * well as by the client-side `useFreePacks` store.
 *
 * How many packs a signed-out visitor can rip before we ask them to sign in.
 * Tuned for conversion: enough opens to hook the dopamine loop, few enough that
 * the sign-in nudge still lands while interest is high.
 */
export const FREE_PACK_LIMIT = 3
