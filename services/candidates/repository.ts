import 'server-only'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/results'
import { fromSupabase, err, ok } from '@/lib/results'
import { Tables } from '@/database.types'
import { isSupabaseError } from '@/lib/supabase/utils'
import { isNil } from 'lodash'

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
): Promise<Result<string, { id: string; weekend_id: string | null } | null>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('candidates')
    .select('id, weekend_id')
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
 * Gets the IDs of non-rejected candidates for a specific weekend.
 */
export async function getCandidateIdsByWeekend(
  weekendId: string
): Promise<Result<string, string[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('candidates')
    .select('id')
    .eq('weekend_id', weekendId)
    .neq('status', 'rejected')

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok((data ?? []).map((c) => c.id))
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

/**
 * Counts candidates on a weekend that are waiting on a review decision.
 *
 * `pending_approval` is the only status in the review flow that means "forms
 * are in, the Pre-Weekend Couple owes a decision" — everything before it is
 * waiting on the candidate or sponsor, and everything after it has already
 * been decided (see `app/(member)/review-candidates`).
 */
export async function getCandidateReviewCountByWeekend(
  weekendId: string
): Promise<Result<string, number>> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true })
    .eq('weekend_id', weekendId)
    .eq('status', 'pending_approval')

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(count ?? 0)
}

/**
 * Counts non-rejected candidates for several weekends in one round trip.
 * Every requested id is present in the result, defaulting to 0.
 */
export async function getCandidateCountsByWeekends(
  weekendIds: string[]
): Promise<Result<string, Record<string, number>>> {
  if (weekendIds.length === 0) {
    return ok({})
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('candidates')
    .select('weekend_id')
    .in('weekend_id', weekendIds)
    .neq('status', 'rejected')

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  const counts: Record<string, number> = Object.fromEntries(
    weekendIds.map((id) => [id, 0])
  )
  for (const row of data ?? []) {
    if (isNil(row.weekend_id)) continue
    counts[row.weekend_id] = (counts[row.weekend_id] ?? 0) + 1
  }

  return ok(counts)
}
