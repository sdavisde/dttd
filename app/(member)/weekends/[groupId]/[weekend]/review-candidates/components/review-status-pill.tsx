import type { CandidateStatus } from '@/lib/candidates/types'
import { STATUS_PILLS, type PillTone } from '@/lib/candidates/review'
import { cn } from '@/lib/utils'

const TONE_CLASSES: Record<PillTone, string> = {
  cream:
    'border border-secondary-border bg-secondary text-secondary-foreground',
  muted: 'bg-muted text-muted-foreground',
  success: 'bg-success/15 text-success',
  outline: 'border border-border text-muted-foreground',
}

type ReviewStatusPillProps = {
  status: CandidateStatus
  /** `md` is the larger pill beside the detail title. */
  size?: 'sm' | 'md'
  className?: string
}

/**
 * The board's status pill for the review queue — plain words a reviewer
 * uses ("Ready to review", "Payment requested"), never the enum value.
 */
export function ReviewStatusPill({
  status,
  size = 'sm',
  className,
}: ReviewStatusPillProps) {
  const pill = STATUS_PILLS[status]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full font-semibold whitespace-nowrap',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1 text-[13px]',
        TONE_CLASSES[pill.tone],
        className
      )}
    >
      {pill.label}
    </span>
  )
}
