'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Generic centred modal with a backdrop, escape-to-close and body scroll lock.
 * Header may be replaced wholesale via `header` for richer layouts (e.g. a
 * profile banner); otherwise `title`/`subtitle` render a standard header.
 */
export function ModalShell({
  title,
  subtitle,
  header,
  onClose,
  footer,
  children,
  maxWidthClassName = 'max-w-2xl',
  bodyClassName,
}: {
  title?: string
  subtitle?: ReactNode
  header?: ReactNode
  onClose: () => void
  footer?: ReactNode
  children: ReactNode
  maxWidthClassName?: string
  bodyClassName?: string
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/85 p-4 py-8 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={cn(
          'flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl',
          maxWidthClassName,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {header ?? (
          <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
            <div className="min-w-0">
              {title && (
                <h2 className="truncate font-display text-lg font-extrabold text-foreground">
                  {title}
                </h2>
              )}
              {subtitle && (
                <div className="mt-0.5 text-sm text-muted-foreground">
                  {subtitle}
                </div>
              )}
            </div>
            <CloseButton onClose={onClose} />
          </header>
        )}

        <div className={cn('max-h-[70vh] overflow-y-auto px-5 py-4', bodyClassName)}>
          {children}
        </div>

        {footer && (
          <footer className="border-t border-border px-5 py-4">{footer}</footer>
        )}
      </div>
    </div>
  )
}

export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground transition-colors hover:text-foreground"
    >
      <X className="size-4" />
    </button>
  )
}
