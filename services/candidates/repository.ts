import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { fromSupabase } from '@/lib/results'

export const CandidateQuery = `
  *,
  candidate_info(*),
  candidate_sponsorship_info(*),
  candidate_payments(*)
`

export const getCandidateById = async (candidateId: string) => {
  const supabase = await createClient()
  const response = await supabase
    .from('candidates')
    .select(CandidateQuery)
    .eq('id', candidateId)
    .single()
  return fromSupabase(response)
}

export const getAllCandidates = async () => {
  const supabase = await createClient()
  const response = await supabase
    .from('candidates')
    .select(CandidateQuery)
  return fromSupabase(response)
}
