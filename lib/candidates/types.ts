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
  // Sponsorship information
  sponsor_phone?: string | null
  sponsor_address?: string | null
  sponsor_church?: string | null
  sponsor_weekend?: string | null
  reunion_group?: string | null
  contact_frequency?: string | null
  church_environment?: string | null
  home_environment?: string | null
  social_environment?: string | null
  work_environment?: string | null
  god_evidence?: string | null
  support_plan?: string | null
  prayer_request?: string | null
  payment_owner?: string | null
  attends_secuela?: string | null
}
