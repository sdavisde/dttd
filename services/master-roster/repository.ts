import 'server-only'

import { isNil } from 'lodash'
import { createClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/results'
import { err, ok, fromSupabase } from '@/lib/results'
import { isSupabaseError } from '@/lib/supabase/utils'

const GetMasterRosterQuery = `
  id,
  first_name,
  last_name,
  gender,
  email,
  phone_number,
  address,
  church_affiliation,
  weekend_attended,
  essentials_training_date,
  special_gifts_and_skills,
  user_roles:user_roles (
    roles (
      id,
      label,
      description,
      permissions,
      type
    )
  ),
  users_experience (
    id,
    user_id,
    weekend_id,
    cha_role,
    weekend_reference,
    rollo,
    created_at,
    updated_at
  )
`

export async function getMasterRoster() {
  const supabase = await createClient()
  const response = await supabase
    .from('users')
    .select(GetMasterRosterQuery)
    .order('last_name', { ascending: true })

  return fromSupabase(response)
}

/**
 * Fetches secuela attendance for a given weekend group.
 * Returns a set of user IDs who attend secuela.
 */
export async function findSecuelaAttendees(
  groupId: string
): Promise<Result<string, Set<string>>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekend_group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .eq('attends_secuela', true)

  if (isSupabaseError(error)) {
    return err(`Failed to fetch secuela attendees: ${error.message}`)
  }

  const userIds = new Set((data ?? []).map((row) => row.user_id))
  return ok(userIds)
}

/**
 * Fetches current weekend roster assignments for a weekend (excluding dropped).
 * Returns a map of user_id → roster assignment info.
 */
export async function findRosterAssignments(
  weekendId: string
): Promise<
  Result<
    string,
    Map<string, { rosterId: string; chaRole: string; rollo: string | null }>
  >
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekend_roster')
    .select('id, user_id, cha_role, rollo')
    .eq('weekend_id', weekendId)
    .neq('status', 'drop')

  if (isSupabaseError(error)) {
    return err(`Failed to fetch roster assignments: ${error.message}`)
  }

  const map = new Map<
    string,
    { rosterId: string; chaRole: string; rollo: string | null }
  >()
  for (const row of data ?? []) {
    if (!isNil(row.user_id)) {
      map.set(row.user_id, {
        rosterId: row.id,
        chaRole: row.cha_role ?? '',
        rollo: row.rollo,
      })
    }
  }

  return ok(map)
}

/**
 * Fetches current non-finalized draft roster assignments for a weekend.
 * Returns a map of user_id → draft assignment info.
 */
export async function findDraftAssignments(
  weekendId: string
): Promise<
  Result<
    string,
    Map<string, { draftId: string; chaRole: string; rollo: string | null }>
  >
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('draft_weekend_roster')
    .select('id, user_id, cha_role, rollo')
    .eq('weekend_id', weekendId)
    .is('finalized_at', null)

  if (isSupabaseError(error)) {
    return err(`Failed to fetch draft assignments: ${error.message}`)
  }

  const map = new Map<
    string,
    { draftId: string; chaRole: string; rollo: string | null }
  >()
  for (const row of data ?? []) {
    map.set(row.user_id, {
      draftId: row.id,
      chaRole: row.cha_role,
      rollo: row.rollo,
    })
  }

  return ok(map)
}

/**
 * Fetches the group_id for a given weekend.
 */
export async function findWeekendGroupId(
  weekendId: string
): Promise<Result<string, string | null>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('group_id')
    .eq('id', weekendId)
    .maybeSingle()

  if (isSupabaseError(error)) {
    return err(`Failed to fetch weekend: ${error.message}`)
  }

  return ok(data?.group_id ?? null)
}

const GetWeekendRosterWithExperienceQuery = `
  id,
  user_id,
  status,
  users (
    id,
    users_experience (
      id,
      user_id,
      weekend_id,
      weekend_reference
    )
  )
`

export async function getWeekendRosterWithExperience(weekendId: string) {
  const supabase = await createClient()
  const response = await supabase
    .from('weekend_roster')
    .select(GetWeekendRosterWithExperienceQuery)
    .eq('weekend_id', weekendId)

  return fromSupabase(response)
}
