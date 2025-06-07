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
