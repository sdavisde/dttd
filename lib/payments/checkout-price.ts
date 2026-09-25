import { isNil } from 'lodash'
import type { Result } from '@/lib/results'
import { err, isErr, ok } from '@/lib/results'
import type { GroupFees } from './group-fees'

// What online checkout charges, calculated on the server from the payer's
// weekend group — the browser never supplies an amount or a price. Pure so it
// can be unit-tested.

export type CheckoutFeeType = 'team' | 'candidate'

/** Who an online payment is for. The server prices it; the browser never does. */
export type CheckoutTarget =
  | { kind: 'candidate'; candidateId: string }
  | { kind: 'team'; groupMemberId: string }

/** Why checkout won't start. Each maps to a friendly message on the page. */
export type CheckoutRefusal =
  /** The person's group has no fees set. */
  | 'fees-not-set'
  /** They don't owe this fee: an exempt role, dropped, or not yet approved. */
  | 'not-owed'
  /** They've already covered the fee. */
  | 'already-paid'

export type CheckoutPrice = {
  feeType: CheckoutFeeType
  /** The fee at the cash price. */
  fee: number
  /** Live payments already on record toward it, waivers included. */
  coveredSoFar: number
  /** What is still owed at the cash price. */
  amountDue: number
  /** Card processing added on top when paying online. */
  onlineSurcharge: number
  /** What Stripe charges: the amount still owed plus the surcharge. */
  chargeAmount: number
}

const roundCents = (amount: number) => Math.round(amount * 100) / 100

export function priceCheckout({
  feeType,
  fees,
  owes,
  coveredSoFar,
}: {
  feeType: CheckoutFeeType
  fees: GroupFees | null
  /** False for an exempt role, a dropped member, or an unapproved candidate. */
  owes: boolean
  coveredSoFar: number
}): Result<CheckoutRefusal, CheckoutPrice> {
  if (isNil(fees)) return err('fees-not-set')
  if (!owes) return err('not-owed')

  const fee = feeType === 'team' ? fees.teamFee : fees.candidateFee
  const amountDue = roundCents(Math.max(fee - coveredSoFar, 0))
  if (amountDue <= 0) return err('already-paid')

  return ok({
    feeType,
    fee,
    coveredSoFar: roundCents(coveredSoFar),
    amountDue,
    onlineSurcharge: fees.onlineSurcharge,
    chargeAmount: roundCents(amountDue + fees.onlineSurcharge),
  })
}

/** Stripe amounts are integer cents. */
export function toStripeAmount(dollars: number): number {
  return Math.round(dollars * 100)
}

export const CHECKOUT_REFUSAL_MESSAGES: Record<
  CheckoutFeeType,
  Record<CheckoutRefusal, string>
> = {
  team: {
    'fees-not-set':
      "The team fee for this weekend hasn't been set yet. Please check back soon.",
    'not-owed': "You don't owe a team fee for this weekend.",
    'already-paid': 'Your team fee is already paid. Thank you!',
  },
  candidate: {
    'fees-not-set':
      "The candidate fee for this weekend hasn't been set yet. Please check back soon.",
    'not-owed': "This candidate isn't ready to pay yet.",
    'already-paid': "This candidate's fee is already paid. Thank you!",
  },
}

/** Which fee a completed checkout session paid, from its `fee_type` tag. */
export function checkoutFeeTypeFromMetadata(
  metadata: Record<string, string> | null | undefined
): CheckoutFeeType | null {
  const feeType = metadata?.fee_type
  return feeType === 'candidate' || feeType === 'team' ? feeType : null
}

/** Where someone stands on their own team fee, for the member pages. */
export type TeamFeeStatus =
  | { state: 'paid' }
  /** An exempt role, or no longer on the team. */
  | { state: 'not-owed' }
  | { state: 'fees-not-set' }
  | { state: 'owes'; fee: number; coveredSoFar: number; amountDue: number }

/**
 * A team fee counts as paid only once the full amount is covered — a
 * partial payment, or a fee raised after paying, still leaves money owed.
 */
export function teamFeeStatusFromPrice(
  price: Result<CheckoutRefusal, CheckoutPrice>
): TeamFeeStatus {
  if (isErr(price)) {
    switch (price.error) {
      case 'already-paid':
        return { state: 'paid' }
      case 'not-owed':
        return { state: 'not-owed' }
      case 'fees-not-set':
        return { state: 'fees-not-set' }
    }
  }
  return {
    state: 'owes',
    fee: price.data.fee,
    coveredSoFar: price.data.coveredSoFar,
    amountDue: price.data.amountDue,
  }
}

/** True when there's nothing left for the member to do about their team fee. */
export function isTeamFeeSettled(status: TeamFeeStatus): boolean {
  return status.state === 'paid' || status.state === 'not-owed'
}
