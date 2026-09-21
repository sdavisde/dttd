import { isNil } from 'lodash'
import type { PaymentTransactionDTO } from '@/services/payment'
import { cashPriceOf } from './compute-totals'

// Outstanding fees are calculated, never stored. This module is the pure half:
// given the people the active weekend group expects a fee from and the
// payments on record, work out who still owes and how much. No server imports
// so it stays unit-testable.

/**
 * Someone the active weekend group expects a fee from: a non-rejected
 * candidate, or a team member on an active (non-dropped) roster.
 */
export type FeePerson = {
  /** Where a payment for this person should be recorded. */
  targetType: 'candidate' | 'weekend_group_member' | 'weekend_roster'
  targetId: string
  /**
   * Other target IDs whose payments also count for this person — a team
   * member's roster rows, which older payments were recorded against.
   */
  legacyTargetIds: string[]
  name: string | null
  /** Who is expected to pay: the team member, or the candidate's sponsor. */
  expectedPayer: string | null
  weekendId: string | null
  weekendNumber: number | null
  weekendType: 'MENS' | 'WOMENS' | null
}

export type OutstandingFee = FeePerson & {
  /** The fee this person owes in full (cash price). */
  feeAmount: number
  /** Live payments already on record for them, waived fees included. */
  coveredSoFar: number
  /** What is still owed. Always greater than zero. */
  amountDue: number
}

type FeePrices = {
  /** Stripe (online) prices in dollars; the cash price is derived from them. */
  teamFee: number
  candidateFee: number
}

/**
 * Who still owes a fee, and how much.
 *
 * A waived row counts toward "covered" exactly like money does — a waived fee
 * is not an unpaid fee. Voided rows never count. The fee owed is the cash
 * price, matching computeActiveWeekendFinancials, so someone who paid the
 * online price is simply settled rather than in credit.
 */
export function deriveOutstandingFees(
  people: FeePerson[],
  payments: PaymentTransactionDTO[],
  prices: FeePrices
): OutstandingFee[] {
  const coveredByTarget = new Map<string, number>()
  for (const p of payments) {
    if (!isNil(p.voided_at) || isNil(p.target_id)) continue
    coveredByTarget.set(
      p.target_id,
      (coveredByTarget.get(p.target_id) ?? 0) + p.gross_amount
    )
  }

  const outstanding: OutstandingFee[] = []
  for (const person of people) {
    const feeAmount = cashPriceOf(
      person.targetType === 'candidate' ? prices.candidateFee : prices.teamFee
    )
    const coveredSoFar = [person.targetId, ...person.legacyTargetIds].reduce(
      (sum, id) => sum + (coveredByTarget.get(id) ?? 0),
      0
    )
    const amountDue = feeAmount - coveredSoFar
    if (amountDue <= 0) continue
    outstanding.push({ ...person, feeAmount, coveredSoFar, amountDue })
  }
  return outstanding
}
