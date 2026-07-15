'use client'

import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  X,
} from 'lucide-react'
import type { TradeOffer, TradeItem, TradeActionResult } from '@/lib/trades'
import { Button } from '@/components/ui/button'
import { TradeModalShell } from './trade-modal-shell'
import { TradeCardThumb } from './trade-card-thumb'

function timeAgo(ms: number): string {
  const secs = Math.floor((Date.now() - ms) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function TradeDetailModal({
  offers,
  startIndex = 0,
  onClose,
  onRespond,
  onModify,
}: {
  offers: TradeOffer[]
  startIndex?: number
  onClose: () => void
  onRespond: (
    offerId: number,
    action: 'accept' | 'decline' | 'cancel',
  ) => Promise<TradeActionResult>
  onModify: (offer: TradeOffer) => void
}) {
  const [list, setList] = useState<TradeOffer[]>(offers)
  const [index, setIndex] = useState(
    Math.min(Math.max(0, startIndex), Math.max(0, offers.length - 1)),
  )
  const [busy, setBusy] = useState<'accept' | 'decline' | 'cancel' | null>(null)
  const [confirmAccept, setConfirmAccept] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const offer = list[index]

  const subtitle = useMemo(() => {
    if (!offer) return null
    const other = offer.outgoing ? offer.to : offer.from
    return (
      <span>
        {offer.outgoing ? 'To ' : 'From '}
        <span className="font-semibold text-foreground">
          {other.name ?? 'player'}
        </span>{' '}
        · {timeAgo(offer.createdAt)}
      </span>
    )
  }, [offer])

  if (!offer) {
    onClose()
    return null
  }

  const act = async (action: 'accept' | 'decline' | 'cancel') => {
    setBusy(action)
    setError(null)
    const result = await onRespond(offer.id, action)
    setBusy(null)
    setConfirmAccept(false)
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong.')
      return
    }
    const next = list.filter((_, i) => i !== index)
    if (next.length === 0) {
      onClose()
      return
    }
    setList(next)
    setIndex((i) => Math.min(i, next.length - 1))
  }

  const giverName = offer.from.name ?? 'They'
  const takerName = offer.to.name ?? 'You'

  return (
    <TradeModalShell
      title={offer.outgoing ? 'Your trade offer' : 'Trade offer'}
      subtitle={subtitle}
      onClose={onClose}
      footer={
        <div className="space-y-3">
          {error && (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-4" />
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {offer.outgoing ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => act('cancel')}
                disabled={busy !== null}
              >
                {busy === 'cancel' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <X className="size-4" />
                )}
                Cancel offer
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => act('decline')}
                  disabled={busy !== null}
                  className="text-muted-foreground"
                >
                  {busy === 'decline' ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <X className="size-4" />
                  )}
                  Decline
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onModify(offer)}
                  disabled={busy !== null}
                >
                  <Pencil className="size-4" />
                  Modify
                </Button>
                {confirmAccept ? (
                  <Button
                    size="sm"
                    onClick={() => act('accept')}
                    disabled={busy !== null}
                  >
                    {busy === 'accept' ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    Confirm swap
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setConfirmAccept(true)}>
                    <Check className="size-4" />
                    Accept
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {list.length > 1 && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              aria-label="Previous offer"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs font-semibold text-muted-foreground">
              Offer {index + 1} of {list.length}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIndex((i) => Math.min(list.length - 1, i + 1))}
              disabled={index === list.length - 1}
              aria-label="Next offer"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}

        {offer.message && (
          <p className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm italic text-muted-foreground">
            “{offer.message}”
          </p>
        )}

        <ItemColumn
          label={`${giverName} give${giverName === 'They' ? '' : 's'}`}
          items={offer.fromItems}
          emptyLabel="Nothing"
        />
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            in exchange for
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <ItemColumn
          label={`${takerName} give${takerName === 'You' ? '' : 's'}`}
          items={offer.toItems}
          emptyLabel="Nothing"
        />
      </div>
    </TradeModalShell>
  )
}

function ItemColumn({
  label,
  items,
  emptyLabel,
}: {
  label: string
  items: TradeItem[]
  emptyLabel: string
}) {
  const total = items.reduce((n, i) => n + i.quantity, 0)
  return (
    <section>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        {total > 0 && (
          <span className="ml-1 text-muted-foreground/70">({total})</span>
        )}
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground/70">{emptyLabel}</p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {items.map((item) => (
            <div key={item.cardId} className="space-y-1">
              <TradeCardThumb
                card={item}
                quantity={item.quantity}
              />
              <p className="truncate text-center text-[0.65rem] text-muted-foreground">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
