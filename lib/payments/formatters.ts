import type { PaymentTransactionDTO } from '@/services/payment'

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
 * e.g. "DTTD Mens #45 — Men's" or "Unknown"
 */
export function formatWeekendLabel(payment: PaymentTransactionDTO): string {
  if (payment.weekend_title === null && payment.weekend_type === null)
    return 'Unknown'
  const type =
    payment.weekend_type === 'MENS'
      ? "Men's"
      : payment.weekend_type === 'WOMENS'
        ? "Women's"
        : ''
  return payment.weekend_title !== null
    ? `${payment.weekend_title} — ${type}`
    : type
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
