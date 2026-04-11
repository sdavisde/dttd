import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/results'
import { err, ok } from '@/lib/results'
import { isSupabaseError } from '@/lib/supabase/utils'
import type { RawDraftRosterWithUser } from './types'

/**
 * Query constant for draft roster with user data.
 * Uses FK hint to disambiguate the two user FK relationships.
 */
const DraftRosterQuery = `
  id,
  weekend_id,
  user_id,
  cha_role,
  rollo,
  created_by,
  created_at,
  finalized_at,
  users!draft_weekend_roster_user_id_fkey (
    id,
    first_name,
    last_name,
    email,
    phone_number
  )
`

/**
 * Inserts a new draft roster entry.
 */
export async function insertDraft(data: {
  weekend_id: string
  user_id: string
  cha_role: string
  rollo?: string | null
  created_by: string
}): Promise<Result<string, void>> {
  const supabase = await createClient()

  const { error } = await supabase.from('draft_weekend_roster').insert({
    weekend_id: data.weekend_id,
    user_id: data.user_id,
    cha_role: data.cha_role,
    rollo: data.rollo ?? null,
    created_by: data.created_by,
  })

  if (isSupabaseError(error)) {
    return err(`Failed to insert draft roster entry: ${error.message}`)
  }

  return ok(undefined)
}

/**
 * Fetches all non-finalized draft roster entries for a weekend, with user data.
 */
export async function findDraftsByWeekendId(
  weekendId: string
): Promise<Result<string, RawDraftRosterWithUser[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('draft_weekend_roster')
    .select(DraftRosterQuery)
    .eq('weekend_id', weekendId)
    .is('finalized_at', null)

  if (isSupabaseError(error)) {
    return err(`Failed to fetch draft roster: ${error.message}`)
  }

  return ok(data ?? [])
}

/**
 * Fetches a single draft roster entry by ID, with user data.
 */
export async function findDraftById(
  draftId: string
): Promise<Result<string, RawDraftRosterWithUser | null>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('draft_weekend_roster')
    .select(DraftRosterQuery)
    .eq('id', draftId)
    .maybeSingle()

  if (isSupabaseError(error)) {
    return err(`Failed to fetch draft roster entry: ${error.message}`)
  }

  return ok(data)
}

/**
 * Deletes a draft roster entry.
 */
export async function deleteDraft(
  draftId: string
): Promise<Result<string, void>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('draft_weekend_roster')
    .delete()
    .eq('id', draftId)

  if (isSupabaseError(error)) {
    return err(`Failed to delete draft roster entry: ${error.message}`)
  }

  return ok(undefined)
}

/**
 * Marks a draft roster entry as finalized by setting finalized_at.
 */
export async function markDraftFinalized(
  draftId: string
): Promise<Result<string, void>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('draft_weekend_roster')
    .update({ finalized_at: new Date().toISOString() })
    .eq('id', draftId)

  if (isSupabaseError(error)) {
    return err(`Failed to finalize draft roster entry: ${error.message}`)
  }

  return ok(undefined)
}
