/** Discount applied to manual payments (cash/check) vs online payments */
const MANUAL_PAYMENT_DISCOUNT = 10

/** Minimal shape required from a payment record for status calculations. */
type PaymentLike = {
  gross_amount: number
  payment_intent_id: string | null
}

/**
 * Whether any of the given payments were recorded manually (cash/check).
 * Manual payments are identified by a `manual_` prefix on the payment_intent_id.
 */
export function hasManualPayments(payments: PaymentLike[]): boolean {
  return payments.some(
    (p) => p.payment_intent_id?.startsWith('manual_') === true
  )
}

/**
 * Returns the required fee for a set of payments, accounting for the
 * manual-payment discount when any payment was made by cash or check.
 *
 * @param payments  The payment records to inspect
 * @param baseFee   The full online fee (from Stripe)
 */
export function getRequiredFee(
  payments: PaymentLike[],
  baseFee: number
): number {
  return hasManualPayments(payments)
    ? baseFee - MANUAL_PAYMENT_DISCOUNT
    : baseFee
}

/**
 * Sum the gross amounts across all payment records.
 */
export function getTotalPaid(payments: PaymentLike[]): number {
  return payments.reduce((sum, p) => sum + p.gross_amount, 0)
}

export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid'

/**
 * Determine the payment status label for a set of payments.
 *
 * @param payments  The payment records to evaluate
 * @param baseFee   The full online fee (from Stripe)
 */
export function getPaymentStatus(
  payments: PaymentLike[],
  baseFee: number
): PaymentStatus {
  const paid = getTotalPaid(payments)
  if (paid <= 0) return 'Unpaid'
  if (paid >= getRequiredFee(payments, baseFee)) return 'Paid'
  return 'Partial'
}

export type PaymentSummary = {
  totalPaid: number
  totalFee: number
  balance: number
  status: PaymentStatus
}

/**
 * Full payment summary for display in modals and info components.
 *
 * @param payments  The payment records to evaluate
 * @param baseFee   The full online fee (from Stripe)
 */
export function getPaymentSummary(
  payments: PaymentLike[],
  baseFee: number
): PaymentSummary {
  const totalPaid = getTotalPaid(payments)
  const totalFee = getRequiredFee(payments, baseFee)
  const balance = totalFee - totalPaid

  return {
    totalPaid,
    totalFee,
    balance,
    status:
      totalPaid <= 0 ? 'Unpaid' : totalPaid >= totalFee ? 'Paid' : 'Partial',
  }
}
