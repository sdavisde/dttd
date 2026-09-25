import { isNil } from 'lodash'
import { IntentLink } from '@/components/ui/intent-link'
import { cn } from '@/lib/utils'

export type SegmentedOption<T extends string> = {
  value: T
  label: React.ReactNode
  /** When set, the segment is a link (server-rendered switch) instead of a button. */
  href?: string
}

type SegmentedControlProps<T extends string> = {
  value: T
  options: SegmentedOption<T>[]
  /** Required for button segments; ignored when every option carries an href. */
  onValueChange?: (value: T) => void
  'aria-label': string
  className?: string
  /** `sm` is the board's compact chip; `md` keeps the 36px control height at md+. */
  size?: 'sm' | 'md'
}

/**
 * The board's segmented control (All / Outstanding / Paid, Men's / Women's):
 * a bordered pill row whose active segment fills brown. Segments are 44px
 * tall on touch screens and step down to the compact height at md+, where a
 * pointer is doing the clicking. Link segments let a server page switch
 * without any client state; they prefetch on intent (hover / focus / touch).
 */
export function SegmentedControl<T extends string>({
  value,
  options,
  onValueChange,
  className,
  size = 'sm',
  ...props
}: SegmentedControlProps<T>) {
  const segmentClass = (active: boolean) =>
    cn(
      'flex h-11 items-center px-3 text-[13px] whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none sm:px-4',
      size === 'sm' ? 'md:h-8' : 'md:h-9',
      active
        ? 'bg-primary font-semibold text-primary-foreground'
        : 'font-medium text-nav-foreground hover:bg-muted'
    )

  return (
    <div
      role="radiogroup"
      aria-label={props['aria-label']}
      className={cn(
        'flex max-w-full overflow-hidden rounded-md border bg-card',
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        if (!isNil(option.href)) {
          return (
            <IntentLink
              key={option.value}
              href={option.href}
              role="radio"
              aria-checked={active}
              className={segmentClass(active)}
            >
              {option.label}
            </IntentLink>
          )
        }
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onValueChange?.(option.value)}
            className={segmentClass(active)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
