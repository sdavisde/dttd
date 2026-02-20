import 'server-only'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { fromSupabase, Result, err, ok } from '@/lib/results'
import { Tables } from '@/database.types'
import { isSupabaseError } from '@/lib/supabase/utils'

export const CandidateQuery = `
  *,
  candidate_info(*),
  candidate_sponsorship_info(*)
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
 * Gets the count of non-rejected candidates for a specific weekend.
 */
export async function getCandidateCountByWeekend(
  weekendId: string
): Promise<Result<string, number>> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true })
    .eq('weekend_id', weekendId)
    .neq('status', 'rejected')

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(count ?? 0)
}
