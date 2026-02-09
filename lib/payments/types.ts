/**
 * Payment types matching the new payment_transaction schema.
 * These types are used for the admin payments display.
 */

/**
 * Payment type values matching the payment_transaction.type column.
 */
export type PaymentType = 'fee' | 'donation' | 'other'

/**
 * Target type values matching the payment_transaction.target_type column.
 */
export type TargetType = 'candidate' | 'weekend_roster' | null

/**
 * Payment method values matching the payment_transaction.payment_method column.
 */
export type PaymentMethod = 'stripe' | 'cash' | 'check'

/**
 * Payment record type for the admin payments display.
 * Maps to the PaymentTransactionDTO from the payment service.
 */
export type PaymentRecord = {
  id: string
  type: PaymentType
  target_type: TargetType
  target_id: string | null
  weekend_id: string | null
  payment_intent_id: string | null
  gross_amount: number
  net_amount: number | null
  stripe_fee: number | null
  payment_method: PaymentMethod
  payment_owner: string | null
  notes: string | null
  charge_id: string | null
  balance_transaction_id: string | null
  created_at: string
  // Derived payer info
  payer_name: string | null
  payer_email: string | null
}
