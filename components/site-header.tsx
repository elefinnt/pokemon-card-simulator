import Link from 'next/link'
import { Pokeball } from '@/components/poke-card'
import { AuthButton } from '@/components/auth-button'
import { SoundToggle } from '@/components/sound-toggle'

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Pokeball className="h-7 w-7" />
        <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
          PackRip
        </span>
      </Link>
      <div className="flex items-center gap-1">
        <SoundToggle />
        <AuthButton />
      </div>
    </header>
  )
}
