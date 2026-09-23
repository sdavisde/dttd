import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { isNil } from 'lodash'
import { hubPath } from '@/lib/weekend/hub'
import type { WeekendType } from '@/lib/weekend/types'
import { cn } from '@/lib/utils'

export type ManagementAccess = {
  /** Candidates awaiting a decision, when the viewer may review them. */
  reviewCount: number | null
  canReviewCandidates: boolean
  canBuildRoster: boolean
  canEditWeekend: boolean
}

type ManagementStripProps = ManagementAccess & {
  groupId: string
  weekendId: string
  weekendType: WeekendType
}

const STRIP_BUTTON =
  'inline-flex min-h-11 items-center rounded-md border border-secondary-border bg-card px-3.5 text-[13px] font-semibold text-primary transition-colors hover:bg-muted md:min-h-[34px]'

/**
 * The cream management row under the hub tabs. Access is per feature, not a
 * single gate: each button appears only for people who can use it, and the
 * strip itself only when at least one applies.
 */
export function ManagementStrip({
  groupId,
  weekendId,
  weekendType,
  reviewCount,
  canReviewCandidates,
  canBuildRoster,
  canEditWeekend,
}: ManagementStripProps) {
  if (!canReviewCandidates && !canBuildRoster && !canEditWeekend) return null

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-secondary-border bg-secondary px-4 py-2.5">
      <ShieldCheck
        className="size-4 shrink-0 text-secondary-foreground"
        aria-hidden
      />
      <p className="text-[13.5px] font-semibold text-secondary-foreground">
        You manage this weekend
      </p>
      <div className="flex flex-wrap gap-2 md:ml-1.5">
        {canReviewCandidates && (
          <Link
            href={hubPath(groupId, 'review-candidates', weekendType)}
            className={STRIP_BUTTON}
          >
            Review candidates
            {!isNil(reviewCount) && (
              <span
                className={cn(
                  'ml-1.5 font-medium text-muted-foreground tabular-nums'
                )}
              >
                · {reviewCount} waiting
              </span>
            )}
          </Link>
        )}
        {canBuildRoster && (
          <Link
            href={`/roster-builder?weekendId=${weekendId}`}
            className={STRIP_BUTTON}
          >
            Roster builder
          </Link>
        )}
        {canEditWeekend && (
          <Link href="/admin/weekends" className={STRIP_BUTTON}>
            Edit weekend
          </Link>
        )}
      </div>
    </div>
  )
}
