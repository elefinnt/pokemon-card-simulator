import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { ProfilePageContent } from '@/components/profile/profile-page-content'

export const metadata: Metadata = {
  title: 'Your profile · PackRip',
}

export default function ProfilePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
        style={{
          background:
            'radial-gradient(circle at 50% -10%, color-mix(in oklab, var(--primary) 30%, transparent), transparent 60%)',
        }}
      />

      <SiteHeader />

      <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-4">
        <ProfilePageContent />
      </div>
    </main>
  )
}
