import { isNil } from 'lodash'
import type { ActiveWeekendMetrics } from '@/lib/payments/compute-totals'
import { getGroupStatus } from '@/lib/weekend'
import type { WeekendGroupWithId } from '@/lib/weekend/types'
import { WEEKEND_CANDIDATE_CAPACITY, WeekendStatus } from '@/lib/weekend/types'
import { toLocalDateFromISO } from '@/lib/utils'

// Pure derivation helpers for the admin Weekends page. No server imports so
// the whole module stays unit-testable in Jest.

export type WeekendStats = {
  /** Non-rejected candidates on this weekend; null when the source failed. */
  candidatesConfirmed: number | null
  candidateCapacity: number
  /** Active (non-dropped) roster members; null when the source failed. */
  teamServing: number | null
  /**
   * Unpaid fees (team + candidates) for this weekend; null when payment data
   * is unavailable (source failure or viewer lacks payments access).
   */
  feesOpen: number | null
}

type WeekendStatsInput = {
  candidateCount: number | null
  rosterCount: number | null
  /** This weekend's entry from ActiveWeekendFinancials, when available. */
  financials: ActiveWeekendMetrics | null
}

/**
 * Per-weekend stat tiles. A null input stays null — the omit-don't-approximate
 * rule: the UI drops the tile instead of showing a guess.
 *
 * Fee math intentionally matches `deriveOutstanding` on the dashboard (both
 * count unpaid active team members plus unpaid active candidates), so the two
 * pages can never disagree about how many fees are open.
 */
export function deriveWeekendStats({
  candidateCount,
  rosterCount,
  financials,
}: WeekendStatsInput): WeekendStats {
  const feesOpen = isNil(financials)
    ? null
    : Math.max(financials.teamExpectedCount - financials.teamPaidCount, 0) +
      Math.max(
        financials.candidateExpectedCount - financials.candidatePaidCount,
        0
      )
  return {
    candidatesConfirmed: candidateCount,
    candidateCapacity: WEEKEND_CANDIDATE_CAPACITY,
    teamServing: rosterCount,
    feesOpen,
  }
}

/** Stats for both weekends of the active group, keyed by weekend type. */
export type ActiveGroupStats = Record<
  keyof WeekendGroupWithId['weekends'],
  WeekendStats
>

export type BoardGroupBuckets = {
  /** The group currently marked ACTIVE, if any. */
  active: WeekendGroupWithId | null
  /** Non-active groups that are not over yet (e.g. a planned next group). */
  upcoming: WeekendGroupWithId[]
  /** Finished groups, newest first. */
  past: WeekendGroupWithId[]
}

const groupEndDate = (group: WeekendGroupWithId): Date | null =>
  toLocalDateFromISO(group.weekends.WOMENS?.end_date) ??
  toLocalDateFromISO(group.weekends.MENS?.end_date)

const groupStartDate = (group: WeekendGroupWithId): Date | null =>
  toLocalDateFromISO(group.weekends.MENS?.start_date) ??
  toLocalDateFromISO(group.weekends.WOMENS?.start_date)

/**
 * Buckets groups for the board view: one active card, upcoming (planned)
 * groups, and past groups sorted newest first. A group is past when its
 * status is FINISHED or its last weekend ended before `now`; an active-status
 * group is always the active card regardless of dates.
 */
export function bucketGroupsForBoard(
  groups: WeekendGroupWithId[],
  now: Date = new Date()
): BoardGroupBuckets {
  const buckets: BoardGroupBuckets = { active: null, upcoming: [], past: [] }
  for (const group of groups) {
    const status = getGroupStatus(group)
    if (status === WeekendStatus.ACTIVE) {
      // Data guarantees at most one ACTIVE group; keep the first if not.
      if (isNil(buckets.active)) {
        buckets.active = group
        continue
      }
    }
    const end = groupEndDate(group)
    const isPast =
      status === WeekendStatus.FINISHED || (!isNil(end) && end < now)
    if (isPast) {
      buckets.past.push(group)
    } else {
      buckets.upcoming.push(group)
    }
  }
  buckets.past.sort((a, b) => {
    const aEnd = groupEndDate(a)?.getTime() ?? 0
    const bEnd = groupEndDate(b)?.getTime() ?? 0
    return bEnd - aEnd
  })
  buckets.upcoming.sort((a, b) => {
    const aStart = groupStartDate(a)?.getTime() ?? Number.MAX_SAFE_INTEGER
    const bStart = groupStartDate(b)?.getTime() ?? Number.MAX_SAFE_INTEGER
    return aStart - bStart
  })
  return buckets
}

/**
 * The dashed "start planning" row shows only when nothing is on the books
 * after the active group — i.e. no upcoming (non-past, non-active) group.
 */
export function showStartPlanningRow(buckets: BoardGroupBuckets): boolean {
  return buckets.upcoming.length === 0
}

/** The number the next weekend group would get (max existing + 1). */
export function nextGroupNumber(groups: WeekendGroupWithId[]): number {
  const max = groups.reduce((acc, group) => {
    const num =
      group.weekends.MENS?.number ?? group.weekends.WOMENS?.number ?? 0
    return Math.max(acc, num)
  }, 0)
  return max + 1
}
