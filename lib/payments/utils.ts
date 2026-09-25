import { isNil } from 'lodash'

/** Minimal shape required from a payment record for status calculations. */
type PaymentLike = {
  gross_amount: number
}

/**
 * Sum the gross amounts across all payment records.
 */
export function getTotalPaid(payments: PaymentLike[]): number {
  return payments.reduce((sum, p) => sum + p.gross_amount, 0)
}

export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid' | 'Not owed'

export type PaymentSummary = {
  totalPaid: number
  /** The fee owed, at the cash price. 0 when nothing is owed. */
  totalFee: number
  /** What is still owed; never below zero (the online surcharge is not a credit). */
  balance: number
  status: PaymentStatus
}

/**
 * Full payment summary for display in modals and info components. The fee is
 * the cash price: someone who paid online paid the surcharge on top and is
 * simply settled, not in credit.
 *
 * @param payments  The payment records to evaluate
 * @param fee       The person's fee at the cash price, or null when they owe
 *                  nothing (an exempt role, or a group whose fees aren't set)
 */
export function getPaymentSummary(
  payments: PaymentLike[],
  fee: number | null
): PaymentSummary {
  const totalPaid = getTotalPaid(payments)

  if (isNil(fee) || fee <= 0) {
    return { totalPaid, totalFee: 0, balance: 0, status: 'Not owed' }
  }

  const totalFee = fee
  return {
    totalPaid,
    totalFee,
    balance: Math.max(totalFee - totalPaid, 0),
    status:
      totalPaid <= 0 ? 'Unpaid' : totalPaid >= totalFee ? 'Paid' : 'Partial',
  }
}
