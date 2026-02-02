import 'server-only'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { fromSupabase, Result, err, ok } from '@/lib/results'
import { isSupabaseError } from '@/lib/supabase/utils'
import { Tables } from '@/database.types'
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
    phone_number,
    gender
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
