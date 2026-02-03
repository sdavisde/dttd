import 'server-only'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { fromSupabase, Result, err, ok } from '@/lib/results'
import { Tables } from '@/lib/supabase/database.types'
import { isSupabaseError } from '@/lib/supabase/utils'

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

/**
 * Gets a candidate by ID using admin client.
 * For use in webhook contexts where there is no user session.
 */
export const getCandidateByIdAdmin = async (candidateId: string) => {
  const supabase = createAdminClient()
  const response = await supabase
    .from('candidates')
    .select(CandidateQuery)
    .eq('id', candidateId)
    .single()
  return fromSupabase(response)
}

export const getAllCandidates = async () => {
  const supabase = await createClient()
  const response = await supabase.from('candidates').select(CandidateQuery)
  return fromSupabase(response)
}

/**
 * Finds a candidate record by ID (minimal query for existence check).
 */
export async function findCandidateById(
  id: string
): Promise<Result<string, { id: string } | null>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('candidates')
    .select('id')
    .eq('id', id)
    .single()

  if (isSupabaseError(error)) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return ok(null)
    }
    return err(error.message)
  }

  return ok(data)
}

/**
 * Inserts a manual payment record for a candidate.
 */
export async function insertManualCandidatePayment(data: {
  candidate_id: string
  payment_amount: number
  payment_method: 'cash' | 'check'
  payment_intent_id: string
  payment_owner: string
  notes: string | null
}): Promise<Result<string, Tables<'candidate_payments'>>> {
  const supabase = await createClient()

  const { data: paymentRecord, error } = await supabase
    .from('candidate_payments')
    .insert(data)
    .select()
    .single()

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  if (!paymentRecord) {
    return err('Failed to insert payment record')
  }

  return ok(paymentRecord)
}
