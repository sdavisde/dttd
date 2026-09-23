import { isNil } from 'lodash'
import { cn } from '@/lib/utils'

type StatTileProps = {
  /** The figure, already formatted (a count, "$1,170", "Underway"). */
  value: React.ReactNode
  /** Quiet trailing text beside the figure, e.g. "/ 42" or "days". */
  suffix?: string
  label: string
  /** The cream variant flags a figure that needs attention (fees still open). */
  variant?: 'default' | 'cream'
  className?: string
}

/**
 * The board's stat card: a bordered tile with a serif tabular figure and a
 * muted caption beneath it. Used by the weekend hub; the admin dashboard and
 * Weekends page keep their own tighter variants.
 */
export function StatTile({
  value,
  suffix,
  label,
  variant = 'default',
  className,
}: StatTileProps) {
  const cream = variant === 'cream'
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-1 rounded-lg border px-4.5 py-4',
        cream ? 'border-secondary-border bg-secondary' : 'bg-card',
        className
      )}
    >
      <p
        className={cn(
          'font-serif text-[26px] leading-tight font-semibold tabular-nums',
          cream && 'text-secondary-foreground'
        )}
      >
        {value}
        {!isNil(suffix) && (
          <span
            className={cn(
              'font-sans text-[15px] font-medium',
              cream
                ? 'text-secondary-foreground/70'
                : 'text-muted-foreground/80'
            )}
          >
            {' '}
            {suffix}
          </span>
        )}
      </p>
      <p
        className={cn(
          'text-[13px]',
          cream ? 'text-secondary-foreground' : 'text-muted-foreground'
        )}
      >
        {label}
      </p>
    </div>
  )
}
