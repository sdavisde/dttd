import { isNil } from 'lodash'
import type { OutstandingFee } from '@/lib/payments/outstanding'
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
   * Candidates whose forms are in and who are waiting on a review decision;
   * null when the source failed.
   */
  candidatesToReview: number | null
  /**
   * People on this weekend (team + candidates) with an unpaid fee; null when
   * payment data is unavailable (source failure or viewer lacks payments
   * access).
   */
  feesOpen: number | null
}

type WeekendStatsInput = {
  candidateCount: number | null
  rosterCount: number | null
  /** Candidates awaiting a review decision; null when that source failed. */
  reviewCount?: number | null
  /**
   * People on this weekend with an unpaid fee, from
   * `countOpenFeesByWeekend`; null when the payments source failed or the
   * viewer lacks payments access.
   */
  openFeeCount: number | null
}

/**
 * Per-weekend stat tiles. A null input stays null — the omit-don't-approximate
 * rule: the UI drops the tile instead of showing a guess.
 *
 * Fees open is the per-person count the dashboard tile and the Payments ledger
 * read, bucketed by weekend, so all three pages report the same people.
 */
export function deriveWeekendStats({
  candidateCount,
  rosterCount,
  reviewCount = null,
  openFeeCount,
}: WeekendStatsInput): WeekendStats {
  return {
    candidatesConfirmed: candidateCount,
    candidateCapacity: WEEKEND_CANDIDATE_CAPACITY,
    teamServing: rosterCount,
    candidatesToReview: reviewCount,
    feesOpen: openFeeCount,
  }
}

/** Open fees for one weekend, from the per-person outstanding list. */
export type WeekendOpenFees = {
  /** People on this weekend who still owe a fee. */
  count: number
  /** Dollars those people still owe. */
  amountDue: number
}

/**
 * Buckets the outstanding-fee list by weekend id — the same per-person list
 * the dashboard tile and the Payments ledger read, so the three pages agree.
 *
 * Someone serving both weekends owes one fee and appears once, under the
 * weekend their fee row names; a fee with no weekend belongs to neither and is
 * left out rather than attributed to a guess.
 */
export function countOpenFeesByWeekend(
  fees: OutstandingFee[]
): Record<string, WeekendOpenFees> {
  const byWeekend: Record<string, WeekendOpenFees> = {}
  for (const fee of fees) {
    if (isNil(fee.weekendId)) continue
    const entry = (byWeekend[fee.weekendId] ??= { count: 0, amountDue: 0 })
    entry.count += 1
    entry.amountDue += fee.amountDue
  }
  return byWeekend
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

/**
 * The "39 + 41 candidates" line on a past weekend row, men's first.
 *
 * Returns null unless both of the group's weekends have a count: a half-known
 * pair would read as a total, and the omit-don't-approximate rule applies.
 */
export function formatPastCandidateCounts(
  group: WeekendGroupWithId,
  counts: Record<string, number> | null
): string | null {
  if (isNil(counts)) return null
  const mens = group.weekends.MENS?.id
  const womens = group.weekends.WOMENS?.id
  if (isNil(mens) || isNil(womens)) return null
  const mensCount = counts[mens]
  const womensCount = counts[womens]
  if (isNil(mensCount) || isNil(womensCount)) return null
  return `${mensCount} + ${womensCount} candidates`
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
