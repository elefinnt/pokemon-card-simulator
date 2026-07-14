import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: db ? DrizzleAdapter(db) : undefined,
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
    }),
  ],
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
