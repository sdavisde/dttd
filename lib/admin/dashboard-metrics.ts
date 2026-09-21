import { isNil } from 'lodash'
import type { PaymentTransactionDTO } from '@/services/payment'
import type { ActiveWeekendFinancials } from '@/lib/payments/compute-totals'
import { isCollected } from '@/lib/payments/waived'
import type { WeekendGroupWithId } from '@/lib/weekend/types'

// Pure derivation helpers for the admin dashboard. No server imports so the
// whole module stays unit-testable in Jest.

export type CollectedMetrics = {
  year: number
  /** Gross dollars collected in `year` (matches the summary page's gross semantics). */
  total: number
  count: number
}

/**
 * Gross collected for the calendar year of `now`. `getAllPayments` already
 * excludes voided rows, but voided payments are filtered again here so the
 * math is safe for any payment list.
 */
export function deriveCollectedThisYear(
  payments: PaymentTransactionDTO[],
  now: Date = new Date()
): CollectedMetrics {
  const year = now.getFullYear()
  let total = 0
  let count = 0
  for (const p of payments) {
    if (!isCollected(p)) continue
    if (new Date(p.created_at).getFullYear() !== year) continue
    total += p.gross_amount
    count++
  }
  return { year, total, count }
}

export type OutstandingMetrics = {
  /** Dollars still expected for the active weekend group (never negative). */
  total: number
  /** People (team + candidates) who have not paid their fee yet. */
  openFeeCount: number
}

/**
 * Outstanding money, derived from the same `ActiveWeekendFinancials` the
 * payments summary page renders — the dashboard must never disagree with it.
 */
export function deriveOutstanding(
  financials: ActiveWeekendFinancials
): OutstandingMetrics {
  const total = Math.max(
    financials.overallExpectedTotal - financials.overallReceivedTotal,
    0
  )
  const openFeeCount = financials.weekends.reduce(
    (sum, w) =>
      sum +
      Math.max(w.teamExpectedCount - w.teamPaidCount, 0) +
      Math.max(w.candidateExpectedCount - w.candidatePaidCount, 0),
    0
  )
  return { total, openFeeCount }
}

export type ActionItem =
  | {
      key: 'open-fees'
      openFeeCount: number
      outstandingTotal: number
      href: '/admin/payments?status=outstanding'
    }
  | {
      key: 'schedule-secuela'
      /** The active group's DTTD number, or null when it isn't known. */
      groupNumber: number | null
      href: '/admin/events'
    }
  | { key: 'start-planning'; href: '/admin/weekends' }

/**
 * The active weekend group's secuela slot. Null when there is no active group,
 * or when the lookup failed — a group whose secuela we couldn't check is not a
 * group we can claim has none.
 */
export type ActiveGroupSecuela = {
  groupNumber: number | null
  /** True once a secuela event exists for the group, past or future. */
  isScheduled: boolean
}

type ActionItemsInput = {
  /** Null when the payments source failed or the viewer lacks permission. */
  outstanding: OutstandingMetrics | null
  /** Null when the weekends source failed or the viewer lacks permission. */
  weekendGroups: WeekendGroupWithId[] | null
  /** Null when there's no active group, or its secuela couldn't be looked up. */
  activeGroupSecuela?: ActiveGroupSecuela | null
  now?: Date
}

/**
 * True when some weekend in some group is marked ACTIVE. The money tiles, the
 * rosters, and the community's current-weekend page all key off this, so its
 * absence is worth saying out loud rather than rendering blanks.
 */
export function hasActiveWeekendGroup(groups: WeekendGroupWithId[]): boolean {
  return groups.some((group) =>
    [group.weekends.MENS, group.weekends.WOMENS].some(
      (w) => !isNil(w) && w.status === 'ACTIVE'
    )
  )
}

/**
 * True when nothing upcoming is on the books: no group in PLANNING and no
 * weekend with a start date still ahead of `now`.
 */
export function needsPlanning(
  groups: WeekendGroupWithId[],
  now: Date = new Date()
): boolean {
  return !groups.some((group) => {
    const weekends = [group.weekends.MENS, group.weekends.WOMENS].filter(
      (w) => !isNil(w)
    )
    return weekends.some(
      (w) =>
        w.status === 'PLANNING' ||
        (!isNil(w.start_date) && new Date(w.start_date) > now)
    )
  })
}

/**
 * Items for the "Action items" list. A failed source contributes no item
 * (we can't claim work is needed from data we don't have) — the page signals
 * degraded sources separately.
 */
export function deriveActionItems({
  outstanding,
  weekendGroups,
  activeGroupSecuela = null,
  now = new Date(),
}: ActionItemsInput): ActionItem[] {
  const items: ActionItem[] = []
  if (!isNil(outstanding) && outstanding.openFeeCount > 0) {
    items.push({
      key: 'open-fees',
      openFeeCount: outstanding.openFeeCount,
      outstandingTotal: outstanding.total,
      href: '/admin/payments?status=outstanding',
    })
  }
  if (!isNil(activeGroupSecuela) && !activeGroupSecuela.isScheduled) {
    items.push({
      key: 'schedule-secuela',
      groupNumber: activeGroupSecuela.groupNumber,
      href: '/admin/events',
    })
  }
  if (!isNil(weekendGroups) && needsPlanning(weekendGroups, now)) {
    items.push({ key: 'start-planning', href: '/admin/weekends' })
  }
  return items
}
