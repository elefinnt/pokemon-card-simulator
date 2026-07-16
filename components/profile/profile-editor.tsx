'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { IdCard, Sparkles, ShieldAlert } from 'lucide-react'
import { useProfile } from '@/lib/profile'
import { useCollection } from '@/lib/collection'
import { cn } from '@/lib/utils'
import { ProfileDetailsForm } from './profile-details-form'
import { ShowcaseEditor } from './showcase-editor'
import { AccountSettings } from './account-settings'

type Tab = 'details' | 'showcase' | 'account'

/**
 * The tabbed profile editor (details + showcase). Rendered inline on the
 * profile page; both tabs persist through the shared useProfile hook.
 */
export function ProfileEditor({ onSaved }: { onSaved?: () => void }) {
  const { data: session } = useSession()
  const { data: profile, saveDetails, saveShowcase } = useProfile()
  const { data: collection } = useCollection()
  const [tab, setTab] = useState<Tab>('details')

  const details = async (input: Parameters<typeof saveDetails>[0]) => {
    const result = await saveDetails(input)
    if (result.ok) onSaved?.()
    return result
  }

  const showcase = async (cardIds: string[]) => {
    const result = await saveShowcase(cardIds)
    if (result.ok) onSaved?.()
    return result
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-5 grid grid-cols-3 gap-1 rounded-xl border border-border bg-background/50 p-1">
        <TabButton
          label="Details"
          icon={IdCard}
          active={tab === 'details'}
          onClick={() => setTab('details')}
        />
        <TabButton
          label="Showcase"
          icon={Sparkles}
          active={tab === 'showcase'}
          onClick={() => setTab('showcase')}
        />
        <TabButton
          label="Account"
          icon={ShieldAlert}
          active={tab === 'account'}
          onClick={() => setTab('account')}
        />
      </div>

      {tab === 'details' ? (
        <ProfileDetailsForm
          profile={profile}
          fallbackName={session?.user?.name}
          onSave={details}
        />
      ) : tab === 'showcase' ? (
        <ShowcaseEditor
          profile={profile}
          collection={collection}
          onSave={showcase}
        />
      ) : (
        <AccountSettings />
      )}
    </div>
  )
}

function TabButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  icon: typeof IdCard
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}
