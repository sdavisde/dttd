import { Database } from '@/database.types'

export type CandidateStatus = Database['public']['Enums']['candidate_status']

// Union type that combines all candidate-related fields from the three tables
export type HydratedCandidate = Database['public']['Tables']['candidates']['Row'] & {
  candidate_sponsorship_info?: Database['public']['Tables']['candidate_sponsorship_info']['Row']
  candidate_info?: Database['public']['Tables']['candidate_info']['Row']
}
