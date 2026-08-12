import { isNil } from 'lodash'
import type { PaymentTransactionDTO } from '@/services/payment'
import { formatWeekendGroupTitle, formatWeekendLabelFor } from '@/lib/weekend'

/** Bucket label for payments not attached to any weekend. */
export const NO_WEEKEND_GROUP_LABEL = 'No Weekend'

/**
 * Format a number as USD currency. Returns '—' for null values.
 */
export function formatCurrency(amount: number | null): string {
  if (amount === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Map target_type to a human-readable label.
 */
export function formatTargetType(
  targetType: PaymentTransactionDTO['target_type']
): string {
  switch (targetType) {
    case 'weekend_roster':
    case 'weekend_group_member':
      return 'Team'
    case 'candidate':
      return 'Candidate'
    default:
      return 'Other'
  }
}

/**
 * Map payment_method to a human-readable label.
 */
export function formatPaymentMethod(
  method: PaymentTransactionDTO['payment_method']
): string {
  switch (method) {
    case 'stripe':
      return 'Stripe'
    case 'cash':
      return 'Cash'
    case 'check':
      return 'Check'
    default:
      return method ?? 'Unknown'
  }
}

/**
 * Build a display label for a payment's associated weekend.
 * e.g. "DTTD Mens #45", or "Unknown" when the payment has no weekend.
 */
export function formatWeekendLabel(payment: PaymentTransactionDTO): string {
  const { weekend_number: number, weekend_type: gender } = payment

  if (isNil(number) && isNil(gender)) return 'Unknown'

  return formatWeekendLabelFor({ number, gender })
}

/**
 * Build the group-level label a payment rolls up under, e.g. "DTTD #45".
 * Men's and Women's payments for the same weekend group share this label.
 */
export function formatWeekendGroupLabel(
  payment: PaymentTransactionDTO
): string {
  if (isNil(payment.weekend_number)) return NO_WEEKEND_GROUP_LABEL
  return formatWeekendGroupTitle(payment.weekend_number)
}

/**
 * Badge variant for a given target_type.
 */
export function getTargetTypeBadgeVariant(
  targetType: PaymentTransactionDTO['target_type']
) {
  switch (targetType) {
    case 'weekend_roster':
    case 'weekend_group_member':
      return 'default' as const
    case 'candidate':
      return 'secondary' as const
    default:
      return 'outline' as const
  }
}
