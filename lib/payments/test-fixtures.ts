import type { PaymentTransactionDTO } from '@/services/payment'

/** A live $185 cash candidate fee; override what a test cares about. */
export function makePayment(
  overrides: Partial<PaymentTransactionDTO> = {}
): PaymentTransactionDTO {
  return {
    id: 'payment-1',
    type: 'fee',
    target_type: 'candidate',
    target_id: 'candidate-1',
    weekend_id: 'weekend-mens',
    payment_intent_id: 'manual_1',
    gross_amount: 185,
    net_amount: null,
    stripe_fee: null,
    payment_method: 'cash',
    payment_owner: 'Martha Hughes',
    notes: null,
    charge_id: null,
    balance_transaction_id: null,
    created_at: '2026-08-25T15:00:00.000Z',
    updated_at: null,
    voided_at: null,
    void_reason: null,
    target_name: 'David Park',
    target_email: null,
    weekend_number: 12,
    weekend_type: 'MENS',
    ...overrides,
  }
}
