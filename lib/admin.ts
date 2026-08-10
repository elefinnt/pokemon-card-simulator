import { auth } from '@/auth'

/**
 * Site-owner access is granted by email: set ADMIN_EMAILS to a comma-separated
 * list of sign-in emails (case-insensitive). Anything admin-only checks the
 * current session against that list.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(email.toLowerCase())
}

/** True when the current session belongs to a configured site owner. */
export async function isAdminSession(): Promise<boolean> {
  const session = await auth()
  return Boolean(session?.user?.id) && isAdminEmail(session?.user?.email)
}
