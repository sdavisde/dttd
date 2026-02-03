import 'server-only'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { fromSupabase, Result, err, ok } from '@/lib/results'
import { isSupabaseError } from '@/lib/supabase/utils'
import { Tables } from '@/lib/supabase/database.types'
import {
  Weekend,
  WeekendStatus,
  WeekendStatusValue,
  WeekendType,
  WeekendUpdateInput,
  RawWeekendRecord,
} from '@/lib/weekend/types'
import { RawWeekendRoster } from './types'
import { logger } from '@/lib/logger'
import { isEmpty, isNil } from 'lodash'

/**
 * Query constant for weekend roster with all related data.
 */
export const WeekendRosterQuery = `
  id,
  cha_role,
  status,
  weekend_id,
  user_id,
  created_at,
  rollo,
  completed_statement_of_belief_at,
  completed_commitment_form_at,
  completed_release_of_claim_at,
  completed_camp_waiver_at,
  completed_info_sheet_at,
  emergency_contact_name,
  emergency_contact_phone,
  medical_conditions,
  users (
    id,
    first_name,
    last_name,
    email,
    phone_number
  ),
  weekend_roster_payments (
    id, weekend_roster_id, payment_amount, payment_intent_id, payment_method, created_at, notes
  )
`

/**
 * Fetches all weekends with ACTIVE status.
 */
export async function findActiveWeekends(): Promise<
  Result<string, RawWeekendRecord[]>
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*')
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
    .select('*')
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
  let query = supabase.from('weekends').select('*')

  if (statuses && statuses.length > 0) {
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
 * Fetches a single weekend by ID.
 */
export async function findWeekendById(
  id: string
): Promise<Result<string, Weekend | null>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*')
    .eq('id', id)
    .single()

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data as Weekend | null)
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
    number: number | null
    status: WeekendStatusValue
    title: string | null
  }>
): Promise<Result<string, RawWeekendRecord[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .insert(payloads)
    .select('*')

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
    .select('*')
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
 * Fetches the roster for a specific weekend with all related data.
 */
export async function findWeekendRoster(
  weekendId: string
): Promise<Result<string, RawWeekendRoster[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekend_roster')
    .select(WeekendRosterQuery)
    .eq('weekend_id', weekendId)
    .order('cha_role', { ascending: true })

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok((data ?? []) as RawWeekendRoster[])
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

  if (error) {
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
 * Inserts a manual payment record.
 */
export async function insertManualPayment(data: {
  weekend_roster_id: string
  payment_amount: number
  payment_method: 'cash' | 'check'
  payment_intent_id: string
  notes: string | null
}): Promise<Result<string, Tables<'weekend_roster_payments'>>> {
  const supabase = await createClient()

  const { data: paymentRecord, error } = await supabase
    .from('weekend_roster_payments')
    .insert(data)
    .select()
    .single()

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  if (!paymentRecord) {
    return err('Failed to record payment')
  }

  return ok(paymentRecord)
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
    if (!member.weekend_id) continue

    const weekendType = weekendTypeMap.get(member.weekend_id)
    if (weekendType === WeekendType.MENS) {
      mensLeadership.push(member)
    } else if (weekendType === WeekendType.WOMENS) {
      womensLeadership.push(member)
    }
  }

  return ok({ mensLeadership, womensLeadership })
}
