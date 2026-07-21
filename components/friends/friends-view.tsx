'use client'

import { useMemo, useState } from 'react'
import { useFriends, type Friend } from '@/lib/friends'
import { useTrades, type TradeOffer } from '@/lib/trades'
import { useCollection } from '@/lib/collection'
import { SignInPrompt } from '@/components/sign-in-prompt'
import {
  TradeBuilder,
  type TradeBuilderInitial,
  type TradePartner,
} from '@/components/trades/trade-builder'
import { TradeDetailModal } from '@/components/trades/trade-detail-modal'
import { PublicProfileModal } from '@/components/profile/public-profile-modal'
import { resolveDisplayName } from '@/lib/profile-types'
import { AddFriend } from './add-friend'
import { FriendRequests } from './friend-requests'
import { FriendList } from './friend-list'

function groupBy(offers: TradeOffer[], key: (o: TradeOffer) => string) {
  const map: Record<string, TradeOffer[]> = {}
  for (const offer of offers) {
    ;(map[key(offer)] ??= []).push(offer)
  }
  return map
}

function selectionFromItems(
  items: TradeOffer['fromItems'],
): Record<string, number> {
  return Object.fromEntries(items.map((i) => [i.cardId, i.quantity]))
}

export function FriendsView({
  requiresSignIn = false,
}: {
  requiresSignIn?: boolean
}) {
  const { data, loading, loadError, sendRequest, respond, remove } = useFriends()
  const { data: trades, createOffer, respond: respondTrade } = useTrades()
  const { data: myCollection } = useCollection()

  const [builder, setBuilder] = useState<{
    partner: TradePartner
    initial?: TradeBuilderInitial
  } | null>(null)
  const [detailOffers, setDetailOffers] = useState<TradeOffer[] | null>(null)
  const [profileUserId, setProfileUserId] = useState<string | null>(null)

  const incomingByFriend = useMemo(
    () => groupBy(trades.incoming, (o) => o.from.id),
    [trades.incoming],
  )
  const outgoingByFriend = useMemo(
    () => groupBy(trades.outgoing, (o) => o.to.id),
    [trades.outgoing],
  )

  if (requiresSignIn) {
    return (
      <SignInPrompt
        title="Sign in to add friends"
        description="Sign in to share your friend code and build your crew."
      />
    )
  }

  const openTradeWith = (friend: Friend) => {
    setBuilder({ partner: friend })
  }

  const startCounter = (offer: TradeOffer) => {
    // Counter an incoming offer: I now give what they requested from me, and
    // request what they had offered. The partner is the original sender.
    setDetailOffers(null)
    setBuilder({
      partner: offer.from,
      initial: {
        fromSelection: selectionFromItems(offer.toItems),
        toSelection: selectionFromItems(offer.fromItems),
        message: '',
        replacesId: offer.id,
      },
    })
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
            <FriendList
              friends={data.friends}
              onRemove={remove}
              incomingByFriend={incomingByFriend}
              outgoingByFriend={outgoingByFriend}
              onTrade={openTradeWith}
              onOpenOffers={setDetailOffers}
              onOpenProfile={(friend) => setProfileUserId(friend.id)}
            />
          </>
        )}
      </div>

      {builder && (
        <TradeBuilder
          friend={builder.partner}
          myCollection={myCollection}
          initial={builder.initial}
          onClose={() => setBuilder(null)}
          onSend={createOffer}
        />
      )}

      {detailOffers && (
        <TradeDetailModal
          offers={detailOffers}
          onClose={() => setDetailOffers(null)}
          onRespond={respondTrade}
          onModify={startCounter}
        />
      )}

      {profileUserId && (
        <PublicProfileModal
          userId={profileUserId}
          onClose={() => setProfileUserId(null)}
          onTrade={(profile) => {
            setProfileUserId(null)
            setBuilder({
              partner: {
                id: profile.userId,
                name: resolveDisplayName(profile.displayName, profile.name),
                image: profile.image,
              },
            })
          }}
        />
      )}
    </div>
  )
}
