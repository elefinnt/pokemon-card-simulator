'use client'

import { useEffect } from 'react'
import { RotateCw, LayoutGrid, LibraryBig } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Marks the document so the feedback FAB can get out of the way on phones. */
const BAR_ATTR = 'data-pack-summary-bar'

export function PulledCardsActions({
  packName,
  onOpenAnother,
  onChangePack,
  onViewCollection,
}: {
  packName: string
  onOpenAnother: () => void
  onChangePack: () => void
  onViewCollection?: () => void
}) {
  useEffect(() => {
    document.body.setAttribute(BAR_ATTR, '')
    return () => {
      document.body.removeAttribute(BAR_ATTR)
    }
  }, [])

  return (
    <div className="max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 max-md:border-t max-md:border-border max-md:bg-background/95 max-md:px-3 max-md:pt-3 max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))] md:static md:flex md:flex-wrap md:items-center md:justify-center md:gap-3">
      <div className="flex flex-col gap-2 md:contents">
        <Button
          size="lg"
          onClick={onOpenAnother}
          className="h-11 w-full font-semibold md:h-9 md:w-auto"
        >
          <RotateCw className="size-4" />
          Open another {packName}
        </Button>
        <div className="grid grid-cols-2 gap-2 md:contents">
          {onViewCollection && (
            <Button
              size="lg"
              variant="outline"
              onClick={onViewCollection}
              className="h-11 font-semibold md:h-9"
            >
              <LibraryBig className="size-4" />
              View collection
            </Button>
          )}
          <Button
            size="lg"
            variant="secondary"
            onClick={onChangePack}
            className={
              onViewCollection
                ? 'h-11 font-semibold md:h-9'
                : 'h-11 w-full font-semibold md:h-9 md:w-auto'
            }
          >
            <LayoutGrid className="size-4" />
            Choose different pack
          </Button>
        </div>
      </div>
    </div>
  )
}
