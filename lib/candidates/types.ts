import { z } from 'zod'

export const candidateStatusSchema = z.enum([
  'sponsored',
  'awaiting_forms',
  'pending_approval',
  'awaiting_payment',
  'confirmed',
  'rejected',
])

export type CandidateStatus = z.infer<typeof candidateStatusSchema>

export interface Candidate {
  id: string
  name: string | null
  email: string | null
  sponsor_name: string | null
  sponsor_email: string | null
  status: CandidateStatus
  created_at: string
  weekend: string | null
}
