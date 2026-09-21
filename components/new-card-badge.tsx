import { cn } from '@/lib/utils'

/** Small non-blocking "New" flag for a first-copy pull. */
export function NewCardBadge({
  className,
}: {
  className?: string
}) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 animate-pop-in rounded-full bg-primary px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-wider text-primary-foreground shadow-lg',
        className,
      )}
    >
      New
    </span>
  )
}
