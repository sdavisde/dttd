import type { Database, Tables } from '@/database.types'
import type { PaymentSummary } from '@/lib/payments/utils'

export type CandidateStatus = Database['public']['Enums']['candidate_status']

/**
 * Payment record from the payment_transaction table.
 */
export type PaymentRecord = Tables<'payment_transaction'>

// Union type that combines all candidate-related fields from the three tables
export type HydratedCandidate = Omit<
  Database['public']['Tables']['candidates']['Row'],
  'status'
> & {
  status: CandidateStatus
  candidate_sponsorship_info?: Database['public']['Tables']['candidate_sponsorship_info']['Row']
  candidate_info?: Database['public']['Tables']['candidate_info']['Row']
  /** Payments from payment_transaction table */
  payments?: PaymentRecord[]
  /** Pre-computed payment summary (fee from Stripe, discount-aware) */
  paymentSummary: PaymentSummary
}

export type CandidateFormData = Omit<
  Tables<'candidate_info'>,
  'candidate_id' | 'created_at' | 'updated_at' | 'id'
>
