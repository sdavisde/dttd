// TODO: Add 'candidate_fee' back once candidate payment system is fully implemented
// May also need additional types like 'partial_refund' or 'late_fee' in the future
export type PaymentType = 'team_fee' | 'candidate_fee' | 'refund'

export type PaymentRecord = {
  id: string
  type: PaymentType
  payment_amount: number
  payment_method: string
  payment_intent_id: string
  created_at: string
  notes?: string
  payer_name: string | null
  payer_email: string | null
  // Fee tracking fields
  stripe_fee: number | null
  net_amount: number | null
  // Deposit tracking fields
  deposited_at: string | null
  payout_id: string | null
}

export type TeamFeePayment = {
  id: string
  payment_amount: number
  payment_method: string
  payment_intent_id: string
  created_at: string
  notes?: string
  weekend_roster_id: string
  weekend_roster: {
    users: {
      first_name: string
      last_name: string
      email: string
    }
  }
  // Fee tracking fields
  stripe_fee: number | null
  net_amount: number | null
  // Deposit tracking fields
  deposited_at: string | null
  payout_id: string | null
}

export type CandidatePayment = {
  id: string
  payment_amount: number
  payment_intent_id: string
  created_at: string
  payment_owner: string
  candidate_id: string
  candidates: {
    first_name: string
    last_name: string
    email: string
  }
  // Fee tracking fields
  stripe_fee: number | null
  net_amount: number | null
  // Deposit tracking fields
  deposited_at: string | null
  payout_id: string | null
}
