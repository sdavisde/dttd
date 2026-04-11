import 'server-only'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/results'
import { fromSupabase, err, ok } from '@/lib/results'
import { isSupabaseError } from '@/lib/supabase/utils'
import type { Tables } from '@/database.types'
import type {
  WeekendStatusValue,
  WeekendUpdateInput,
  RawWeekendRecord,
} from '@/lib/weekend/types'
import { WeekendStatus, WeekendType } from '@/lib/weekend/types'
import { logger } from '@/lib/logger'
import { isEmpty, isNil } from 'lodash'

/**
 * Query constant for weekend roster with user data.
 * Note: Payments are fetched separately since payment_transaction uses
 * polymorphic target_id without FK constraints (no Supabase joins possible).
 */
export const WeekendRosterQuery = `
  id,
  cha_role,
  status,
  weekend_id,
  user_id,
  created_at,
  rollo,
  special_needs,
  users (
    id,
    first_name,
    last_name,
    email,
    phone_number
  )
`

/**
 * Raw weekend roster record from DB (without payments).
 * Payments are fetched separately via payment_transaction table.
 */
export type RawWeekendRosterDB = {
  id: string
  cha_role: string | null
  status: string | null
  weekend_id: string | null
  user_id: string | null
  created_at: string
  rollo: string | null
  special_needs: string | null
  users: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone_number: string | null
  } | null
}

/**
 * Fetches all weekends with ACTIVE status.
 */
export async function findActiveWeekends(): Promise<
  Result<string, RawWeekendRecord[]>
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*, weekend_groups(number)')
    .eq('status', WeekendStatus.ACTIVE)

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data ?? [])
}

/**
 * Fetches all weekends belonging to a specific group.
 */
export async function findWeekendsByGroupId(
  groupId: string
): Promise<Result<string, RawWeekendRecord[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*, weekend_groups(number)')
    .eq('group_id', groupId)
    .order('type', { ascending: true })

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok((data ?? []) as RawWeekendRecord[])
}

/**
 * Fetches all weekends, optionally filtered by statuses.
 */
export async function findWeekendsByStatuses(
  statuses?: WeekendStatusValue[]
): Promise<Result<string, RawWeekendRecord[]>> {
  const supabase = await createClient()
  let query = supabase.from('weekends').select('*, weekend_groups(number)')

  if (!isNil(statuses) && statuses.length > 0) {
    query = query.in('status', statuses)
  }

  const { data, error } = await query
    .order('group_id', { ascending: true })
    .order('type', { ascending: true })

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok((data ?? []) as RawWeekendRecord[])
}

/**
 * Fetches a single weekend by ID, joining weekend_groups to restore the number field.
 */
export async function findWeekendById(
  id: string
): Promise<Result<string, RawWeekendRecord | null>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*, weekend_groups(number)')
    .eq('id', id)
    .single()

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data as RawWeekendRecord | null)
}

/**
 * Inserts a new weekend_groups parent record.
 * Must be called before inserting weekends that reference this group_id.
 */
export async function insertWeekendGroupRecord(
  id: string,
  number: number
): Promise<Result<string, void>> {
  const supabase = await createClient()

  const { error } = await supabase.from('weekend_groups').insert({ id, number })

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(undefined)
}

/**
 * Fetches the highest weekend group number.
 * Used to auto-assign the next number when creating a new group.
 */
export async function findMaxWeekendGroupNumber(): Promise<
  Result<string, number>
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekend_groups')
    .select('number')
    .order('number', { ascending: false })
    .limit(1)

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data?.[0]?.number ?? 0)
}

/**
 * Inserts a new weekend group (MENS + WOMENS records).
 */
export async function insertWeekendGroup(
  payloads: Array<{
    group_id: string
    type: WeekendType
    start_date: string
    end_date: string
    status: WeekendStatusValue
    title: string | null
  }>
): Promise<Result<string, RawWeekendRecord[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .insert(payloads)
    .select('*, weekend_groups(number)')

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok((data ?? []) as RawWeekendRecord[])
}

/**
 * Updates a single weekend by group_id and type.
 */
export async function updateWeekendByGroupAndType(
  groupId: string,
  type: WeekendType,
  payload: WeekendUpdateInput
): Promise<Result<string, RawWeekendRecord | null>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .update(payload)
    .eq('group_id', groupId)
    .eq('type', type)
    .select('*, weekend_groups(number)')
    .single()

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data as RawWeekendRecord | null)
}

/**
 * Updates the status of all weekends in a group.
 */
export async function updateWeekendStatusByGroupId(
  groupId: string,
  status: WeekendStatusValue
): Promise<Result<string, void>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('weekends')
    .update({ status })
    .eq('group_id', groupId)

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(undefined)
}

/**
 * Updates all weekends with a specific status to a new status.
 * Used for transitioning ACTIVE → FINISHED when activating a new weekend.
 */
export async function updateWeekendStatusByCurrentStatus(
  fromStatus: WeekendStatusValue,
  toStatus: WeekendStatusValue
): Promise<Result<string, void>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('weekends')
    .update({ status: toStatus })
    .eq('status', fromStatus)

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(undefined)
}

/**
 * Deletes all weekends in a group.
 */
export async function deleteWeekendsByGroupId(
  groupId: string
): Promise<Result<string, void>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('weekends')
    .delete()
    .eq('group_id', groupId)

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(undefined)
}

/**
 * Fetches the roster for a specific weekend with user data.
 * Note: Payments are fetched separately in the service layer.
 */
export async function findWeekendRoster(
  weekendId: string
): Promise<Result<string, RawWeekendRosterDB[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekend_roster')
    .select(WeekendRosterQuery)
    .eq('weekend_id', weekendId)
    .neq('status', 'drop')
    .order('cha_role', { ascending: true })

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok((data ?? []) as RawWeekendRosterDB[])
}

export async function findWeekendRosterIncludingDropped(
  weekendId: string
): Promise<Result<string, RawWeekendRosterDB[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekend_roster')
    .select(WeekendRosterQuery)
    .eq('weekend_id', weekendId)
    .order('cha_role', { ascending: true })

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok((data ?? []) as RawWeekendRosterDB[])
}

/**
 * Fetches a weekend roster record for a specific user and weekend.
 * Uses admin client to bypass RLS - required for payment/webhook flows.
 *
 * IMPORTANT: This function uses createAdminClient() which bypasses Row Level Security.
 * Only use this for payment flows where the user session may not be available (webhooks).
 */
export async function findWeekendRosterRecord(
  userId: string,
  weekendId: string
): Promise<Result<string, Tables<'weekend_roster'> | null>> {
  logger.info(
    `Fetching weekend roster record for team user ID: ${userId} and weekend ID: ${weekendId}`
  )

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('weekend_roster')
    .select('*')
    .eq('user_id', userId)
    .eq('weekend_id', weekendId)
    .single()

  if (!isNil(error)) {
    return err(error.message)
  }

  return ok(data)
}

/**
 * Inserts a new member to the weekend roster.
 */
export async function insertWeekendRosterMember(data: {
  weekend_id: string
  user_id: string
  status: string
  cha_role: string
  rollo: string | null
}): Promise<Result<string, void>> {
  const supabase = await createClient()

  const { error } = await supabase.from('weekend_roster').insert(data)

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(undefined)
}

/**
 * Updates a weekend roster member's status to 'drop'.
 */
export async function dropWeekendRosterMember(
  rosterId: string
): Promise<Result<string, void>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('weekend_roster')
    .update({ status: 'drop' })
    .eq('id', rosterId)

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(undefined)
}

/**
 * Deletes a weekend roster member record.
 */
export async function deleteWeekendRosterMember(
  rosterId: string
): Promise<Result<string, void>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('weekend_roster')
    .delete()
    .eq('id', rosterId)

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(undefined)
}

/**
 * Fetches the special_needs field for a roster record by ID.
 */
export async function findRosterSpecialNeeds(
  id: string
): Promise<Result<string, string | null>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekend_roster')
    .select('special_needs')
    .eq('id', id)
    .single()

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data?.special_needs ?? null)
}

/**
 * Fetches a roster record by ID to verify it exists.
 */
export async function findRosterRecordById(
  id: string
): Promise<Result<string, { id: string } | null>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekend_roster')
    .select('id')
    .eq('id', id)
    .single()

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data)
}

/**
 * Fetches all users ordered by last name.
 */
export async function findAllUsers(): Promise<
  Result<string, Array<Tables<'users'>>>
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('last_name', { ascending: true })

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data ?? [])
}

/**
 * Query constant for leadership team preview (minimal fields needed).
 */
const LeadershipRosterQuery = `
  id,
  cha_role,
  status,
  weekend_id,
  user_id,
  users (
    id,
    first_name,
    last_name
  )
`

/**
 * Raw leadership roster member shape from Supabase query.
 */
export type RawLeadershipRosterMember = {
  id: string
  cha_role: string | null
  status: string | null
  weekend_id: string | null
  user_id: string | null
  users: {
    id: string
    first_name: string | null
    last_name: string | null
  } | null
}

// ============================================================================
// Experience Transition Queries
// ============================================================================

/**
 * Raw roster record shape for experience transition.
 * Includes additional_cha_role and weekend metadata needed to build experience records.
 */
export type RawRosterForExperience = {
  user_id: string
  cha_role: string | null
  additional_cha_role: string | null
  rollo: string | null
  weekend_id: string
  weekend_type: string
  group_number: number | null
}

/**
 * Fetches all non-dropped roster members for a weekend group (both MENS and WOMENS).
 * Joins weekends and weekend_groups to get type and group number.
 */
export async function findActiveRosterByGroupId(
  groupId: string
): Promise<Result<string, RawRosterForExperience[]>> {
  const supabase = await createClient()

  // First get the weekend IDs and metadata for this group
  const { data: weekends, error: weekendError } = await supabase
    .from('weekends')
    .select('id, type, weekend_groups(number)')
    .eq('group_id', groupId)

  if (isSupabaseError(weekendError)) {
    return err(weekendError.message)
  }

  if (isNil(weekends) || isEmpty(weekends)) {
    return ok([])
  }

  const weekendIds = weekends.map((w) => w.id)
  const weekendMeta = new Map(
    weekends.map((w) => [
      w.id,
      {
        type: w.type,
        number: w.weekend_groups?.number ?? null,
      },
    ])
  )

  // Fetch all non-dropped roster members for these weekends
  const { data: roster, error: rosterError } = await supabase
    .from('weekend_roster')
    .select('user_id, cha_role, additional_cha_role, rollo, weekend_id')
    .in('weekend_id', weekendIds)
    .neq('status', 'drop')

  if (isSupabaseError(rosterError)) {
    return err(rosterError.message)
  }

  const results: RawRosterForExperience[] = (roster ?? [])
    .filter((r) => !isNil(r.user_id) && !isNil(r.weekend_id))
    .map((r) => {
      const meta = weekendMeta.get(r.weekend_id!)
      return {
        user_id: r.user_id!,
        cha_role: r.cha_role,
        additional_cha_role: r.additional_cha_role,
        rollo: r.rollo,
        weekend_id: r.weekend_id!,
        weekend_type: meta?.type ?? 'MENS',
        group_number: meta?.number ?? null,
      }
    })

  return ok(results)
}

/**
 * Fetches existing users_experience records for weekends in a group.
 * Used for deduplication to avoid inserting duplicate experience records.
 */
export async function findExistingExperienceForWeekends(
  weekendIds: string[]
): Promise<
  Result<
    string,
    Array<{ user_id: string; cha_role: string; weekend_id: string | null }>
  >
> {
  if (isEmpty(weekendIds)) {
    return ok([])
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users_experience')
    .select('user_id, cha_role, weekend_id')
    .in('weekend_id', weekendIds)

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data ?? [])
}

/**
 * Bulk inserts users_experience records.
 */
export async function insertUserExperienceRecords(
  records: Array<{
    user_id: string
    cha_role: string
    weekend_id: string | null
    weekend_reference: string
    rollo: string | null
  }>
): Promise<Result<string, number>> {
  if (isEmpty(records)) {
    return ok(0)
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users_experience')
    .insert(records)
    .select('id')

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data?.length ?? 0)
}

/**
 * Fetches weekend IDs for a given group.
 */
export async function findWeekendIdsByGroupId(
  groupId: string
): Promise<Result<string, string[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('id')
    .eq('group_id', groupId)

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok((data ?? []).map((w) => w.id))
}

/**
 * Finds the group_id of currently ACTIVE weekends (if any).
 * Returns the first group_id found, or null if no active weekends exist.
 */
export async function findActiveGroupId(): Promise<
  Result<string, string | null>
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('group_id')
    .eq('status', WeekendStatus.ACTIVE)
    .limit(1)

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data?.[0]?.group_id ?? null)
}

// ============================================================================
// Leadership Team Queries
// ============================================================================

/**
 * Result of fetching leadership roster members, grouped by weekend type.
 */
export type ActiveWeekendLeadershipResult = {
  mensLeadership: RawLeadershipRosterMember[]
  womensLeadership: RawLeadershipRosterMember[]
}

/**
 * Fetches leadership roster members from active weekends.
 * Returns roster members grouped by weekend type (MENS/WOMENS).
 */
export async function findActiveWeekendLeadershipRoster(
  leadershipRoles: string[]
): Promise<Result<string, ActiveWeekendLeadershipResult>> {
  const supabase = await createClient()

  // First, get the active weekends
  const { data: activeWeekends, error: weekendError } = await supabase
    .from('weekends')
    .select('id, type')
    .eq('status', WeekendStatus.ACTIVE)

  if (isSupabaseError(weekendError)) {
    return err(weekendError.message)
  }

  if (isNil(activeWeekends) || isEmpty(activeWeekends)) {
    return ok({ mensLeadership: [], womensLeadership: [] })
  }

  // Create a map of weekend ID to type
  const weekendTypeMap = new Map<string, string>()
  for (const weekend of activeWeekends) {
    weekendTypeMap.set(weekend.id, weekend.type)
  }

  const weekendIds = activeWeekends.map((w) => w.id)

  // Fetch leadership roster members from active weekends
  const { data, error } = await supabase
    .from('weekend_roster')
    .select(LeadershipRosterQuery)
    .in('weekend_id', weekendIds)
    .in('cha_role', leadershipRoles)
    .neq('status', 'drop')

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  const roster = data ?? []

  // Group by weekend type
  const mensLeadership: RawLeadershipRosterMember[] = []
  const womensLeadership: RawLeadershipRosterMember[] = []

  for (const member of roster) {
    if (isNil(member.weekend_id)) continue

    const weekendType = weekendTypeMap.get(member.weekend_id)
    if (weekendType === WeekendType.MENS) {
      mensLeadership.push(member)
    } else if (weekendType === WeekendType.WOMENS) {
      womensLeadership.push(member)
    }
  }

  return ok({ mensLeadership, womensLeadership })
}
