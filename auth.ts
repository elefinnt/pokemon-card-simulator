import NextAuth from 'next-auth'
import type { Provider } from 'next-auth/providers'
import Discord from 'next-auth/providers/discord'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/db'

/**
 * Build the enabled provider list. Discord is always on; Google and email
 * magic links switch on only when their env vars are present, so the app runs
 * fine before those credentials are wired up. The sign-in UI reads the live
 * provider list (via `getProviders()`) and hides anything not configured.
 */
function buildProviders(): Provider[] {
  const providers: Provider[] = [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
    }),
  ]

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }),
    )
  }

  // Email magic links need the database adapter to persist verification tokens,
  // so only enable them when both a database and a Resend key are configured.
  if (db && process.env.AUTH_RESEND_KEY) {
    providers.push(
      Resend({
        apiKey: process.env.AUTH_RESEND_KEY,
        from: process.env.AUTH_EMAIL_FROM ?? 'onboarding@resend.dev',
      }),
    )
  }

  return providers
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: db ? DrizzleAdapter(db) : undefined,
  providers: buildProviders(),
  pages: {
    signIn: '/',
  },
  session: {
    strategy: db ? 'database' : 'jwt',
  },
  callbacks: {
    session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id ?? token.sub ?? ''
      }
      return session
    },
  },
})
