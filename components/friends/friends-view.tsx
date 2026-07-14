'use client'

import { useFriends } from '@/lib/friends'
import { SignInPrompt } from '@/components/sign-in-prompt'
import { AddFriend } from './add-friend'
import { FriendRequests } from './friend-requests'
import { FriendList } from './friend-list'

export function FriendsView({ requiresSignIn = false }: { requiresSignIn?: boolean }) {
  const { data, loading, loadError, sendRequest, respond, remove } = useFriends()

  if (requiresSignIn) {
    return (
      <SignInPrompt
        title="Sign in to add friends"
        description="Connect your Discord account to share your friend code and build your crew."
      />
    )
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[minmax(0,20rem)_1fr] md:items-start">
      <AddFriend onSendRequest={sendRequest} />

      <div className="space-y-6">
        {loadError && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-foreground">
            {loadError}
          </p>
        )}
        {loading && data.friends.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Loading friends…
          </p>
        ) : (
          <>
            <FriendRequests
              incoming={data.incoming}
              outgoing={data.outgoing}
              onRespond={respond}
              onCancel={remove}
            />
            <FriendList friends={data.friends} onRemove={remove} />
          </>
        )}
      </div>
    </div>
  )
}
