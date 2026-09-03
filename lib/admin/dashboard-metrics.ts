import { isNil } from 'lodash'
import type { PaymentTransactionDTO } from '@/services/payment'
import type { ActiveWeekendFinancials } from '@/lib/payments/compute-totals'
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
    if (!isNil(p.voided_at)) continue
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

export type BoardHandItem =
  | {
      key: 'open-fees'
      openFeeCount: number
      outstandingTotal: number
      href: '/admin/payments'
    }
  | { key: 'start-planning'; href: '/admin/weekends' }

type BoardHandInput = {
  /** Null when the payments source failed or the viewer lacks permission. */
  outstanding: OutstandingMetrics | null
  /** Null when the weekends source failed or the viewer lacks permission. */
  weekendGroups: WeekendGroupWithId[] | null
  now?: Date
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
 * Items for the "Needs a board hand" list. A failed source contributes no
 * item (we can't claim work is needed from data we don't have) — the page
 * signals degraded sources separately.
 */
export function deriveBoardHandItems({
  outstanding,
  weekendGroups,
  now = new Date(),
}: BoardHandInput): BoardHandItem[] {
  const items: BoardHandItem[] = []
  if (!isNil(outstanding) && outstanding.openFeeCount > 0) {
    items.push({
      key: 'open-fees',
      openFeeCount: outstanding.openFeeCount,
      outstandingTotal: outstanding.total,
      href: '/admin/payments',
    })
  }
  if (!isNil(weekendGroups) && needsPlanning(weekendGroups, now)) {
    items.push({ key: 'start-planning', href: '/admin/weekends' })
  }
  return items
}
