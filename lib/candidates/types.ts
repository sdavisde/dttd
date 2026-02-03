import { Database, Tables } from '@/database.types'

export type CandidateStatus = Database['public']['Enums']['candidate_status']

export type CandidatePayment = Tables<'candidate_payments'>

// Union type that combines all candidate-related fields from the three tables
export type HydratedCandidate = Omit<
  Database['public']['Tables']['candidates']['Row'],
  'status'
> & {
  status: CandidateStatus
  candidate_sponsorship_info?: Database['public']['Tables']['candidate_sponsorship_info']['Row']
  candidate_info?: Database['public']['Tables']['candidate_info']['Row']
  candidate_payments?: CandidatePayment[]
}

export type CandidateFormData = Omit<
  Tables<'candidate_info'>,
  'candidate_id' | 'created_at' | 'updated_at' | 'id'
>
