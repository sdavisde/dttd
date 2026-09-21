import { isNil } from 'lodash'

// A waived fee is a ledger row, not money. The community covers the fee, so
// the person reads as paid, but nothing was collected. Every total that means
// "money in" must skip these rows; every check that means "is this fee
// covered?" must keep them. These helpers are the single place that rule lives.

/** Recorded as the payer on every waived row. */
export const WAIVED_PAID_BY = 'DTTD Community'

type MethodLike = { payment_method: string | null }
type VoidableLike = MethodLike & { voided_at?: string | null }

/** True when the row records a fee the community covered rather than money. */
export function isWaived(payment: MethodLike): boolean {
  return payment.payment_method === 'waived'
}

/**
 * True when the row is real money that was received: not voided, not waived.
 * Use this for anything labelled "collected", gross, net, or received.
 */
export function isCollected(payment: VoidableLike): boolean {
  return isNil(payment.voided_at) && !isWaived(payment)
}
