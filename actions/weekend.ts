'use server'
import { randomUUID } from 'crypto'
import { formatWeekendTitle, trimWeekendTypeFromTitle } from '@/lib/weekend'
import { capitalize } from '@/lib/utils'

import { createClient } from '@/lib/supabase/server'
import { Tables } from '@/database.types'
import { logger } from '@/lib/logger'
import { Result, err, ok, isErr } from '@/lib/results'
import { isSupabaseError } from '@/lib/supabase/utils'
import {
  Weekend,
  WeekendType,
  WeekendStatus,
  WeekendStatusValue,
  WeekendWithGroup,
  RawWeekendRecord,
  WeekendGroup,
  WeekendGroupWithId,
  WeekendWriteInput,
  WeekendUpdateInput,
  CreateWeekendGroupInput,
  UpdateWeekendGroupInput,
} from '@/lib/weekend/types'
import { isNil } from 'lodash'

const toWeekendGroup = (weekends: WeekendWithGroup[]): WeekendGroup => ({
  MENS: weekends.find((weekend) => weekend.type === WeekendType.MENS) ?? null,
  WOMENS:
    weekends.find((weekend) => weekend.type === WeekendType.WOMENS) ?? null,
})

const toWeekendWithGroup = (weekend: RawWeekendRecord): WeekendWithGroup => ({
  ...weekend,
  group_id: weekend.group_id ?? null,
})

const ensureRequiredDates = (
  type: WeekendType,
  payload: WeekendWriteInput
): Result<string, void> => {
  if (!payload.start_date || !payload.end_date) {
    return err(
      `${type} weekend requires both start_date and end_date before saving`
    )
  }

  return ok(undefined)
}

const prepareInsertPayload = (
  groupId: string,
  type: WeekendType,
  payload: WeekendWriteInput
) => ({
  group_id: groupId,
  type,
  start_date: payload.start_date,
  end_date: payload.end_date,
  number: payload.number ?? null,
  status: payload.status ?? WeekendStatus.PLANNING,
  title: payload.title ?? null,
})

export async function getActiveWeekends(): Promise<
  Result<string, Record<WeekendType, Weekend | null>>
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*')
    .eq('status', WeekendStatus.ACTIVE)

  if (isSupabaseError(error)) {
    return err(error?.message)
  }

  if (!data) {
    return err('No active weekend found')
  }

  return ok({
    MENS:
      (data.find((weekend) => weekend.type === WeekendType.MENS) as Weekend) ??
      null,
    WOMENS:
      (data.find(
        (weekend) => weekend.type === WeekendType.WOMENS
      ) as Weekend) ?? null,
  })
}

export async function getWeekendGroup(
  groupId: string
): Promise<Result<string, WeekendGroupWithId>> {
  if (!groupId) {
    return err('group_id is required to fetch a group')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*')
    .eq('group_id', groupId)
    .order('type', { ascending: true })

  if (isSupabaseError(error)) {
    return err(error?.message)
  }

  if (!data || data.length === 0) {
    return err(`Weekend group ${groupId} not found`)
  }

  const typedWeekends = (data as RawWeekendRecord[]).map(toWeekendWithGroup)

  return ok({ groupId, weekends: toWeekendGroup(typedWeekends) })
}

export async function getWeekendGroupsByStatus(
  statuses?: WeekendStatusValue[]
): Promise<Result<string, WeekendGroupWithId[]>> {
  const supabase = await createClient()
  let query = supabase.from('weekends').select('*')

  if (statuses && statuses.length > 0) {
    query = query.in('status', statuses)
  }

  const { data, error } = await query
    .order('group_id', { ascending: true })
    .order('type', { ascending: true })

  if (isSupabaseError(error)) {
    return err(error?.message)
  }

  if (!data || data.length === 0) {
    return ok([])
  }

  const groups = new Map<string, WeekendWithGroup[]>()

  for (const rawWeekend of data as RawWeekendRecord[]) {
    const weekend = toWeekendWithGroup(rawWeekend)

    if (!weekend.group_id) {
      continue
    }

    const existing = groups.get(weekend.group_id) ?? []
    existing.push(weekend)
    groups.set(weekend.group_id, existing)
  }

  const result: WeekendGroupWithId[] = Array.from(groups.entries())
    .map(([groupId, weekends]) => ({
      groupId,
      weekends: toWeekendGroup(weekends),
    }))
    .sort((a, b) => {
      const aNumber =
        a.weekends.MENS?.number ??
        a.weekends.WOMENS?.number ??
        Number.MAX_SAFE_INTEGER
      const bNumber =
        b.weekends.MENS?.number ??
        b.weekends.WOMENS?.number ??
        Number.MAX_SAFE_INTEGER
      return aNumber - bNumber
    })

  return ok(result)
}

export async function setActiveWeekendGroup(
  groupId: string
): Promise<Result<string, WeekendGroupWithId>> {
  if (!groupId) {
    return err('group_id is required to set active weekend')
  }

  const supabase = await createClient()

  // 1. Find all currently ACTIVE weekends and update them to FINISHED
  const { error: finishError } = await supabase
    .from('weekends')
    .update({ status: WeekendStatus.FINISHED })
    .eq('status', WeekendStatus.ACTIVE)

  if (isSupabaseError(finishError)) {
    return err(
      `Failed to mark previous active weekends as finished: ${finishError.message}`
    )
  }

  // 2. Update the selected weekend group to ACTIVE (both MENS and WOMENS)
  const { error: activateError } = await supabase
    .from('weekends')
    .update({ status: WeekendStatus.ACTIVE })
    .eq('group_id', groupId)

  if (isSupabaseError(activateError)) {
    return err(
      `Failed to set weekend group as active: ${activateError.message}`
    )
  }

  // 3. Return the updated group
  return getWeekendGroup(groupId)
}

export async function createWeekendGroup(
  input: CreateWeekendGroupInput
): Promise<Result<string, WeekendGroupWithId>> {
  if (!input.groupId) {
    return err('groupId is required when creating a weekend group')
  }

  const mensValidation = ensureRequiredDates(WeekendType.MENS, input.mens)
  if (isErr(mensValidation)) {
    return err(mensValidation.error)
  }

  const womensValidation = ensureRequiredDates(WeekendType.WOMENS, input.womens)
  if (isErr(womensValidation)) {
    return err(womensValidation.error)
  }

  const supabase = await createClient()

  const insertPayload = [
    prepareInsertPayload(input.groupId, WeekendType.MENS, input.mens),
    prepareInsertPayload(input.groupId, WeekendType.WOMENS, input.womens),
  ]

  const { data, error } = await supabase
    .from('weekends')
    .insert(insertPayload)
    .select('*')

  if (isSupabaseError(error)) {
    return err(error?.message)
  }

  if (!data || data.length === 0) {
    return err('Failed to create weekend group')
  }

  return ok({
    groupId: input.groupId,
    weekends: toWeekendGroup(
      (data as RawWeekendRecord[]).map(toWeekendWithGroup)
    ),
  })
}

export async function updateWeekendGroup(
  groupId: string,
  updates: UpdateWeekendGroupInput
): Promise<Result<string, WeekendGroupWithId>> {
  if (!groupId) {
    return err('group_id is required to update a group')
  }

  if (!updates.mens && !updates.womens) {
    return err('No updates were provided for either mens or womens weekend')
  }

  const supabase = await createClient()

  const applyUpdate = async (
    type: WeekendType,
    payload?: WeekendUpdateInput
  ): Promise<Result<string, WeekendWithGroup | null>> => {
    if (!payload) {
      return ok(null)
    }

    if (!hasDefinedUpdateValues(payload)) {
      return ok(null)
    }

    const { data, error } = await supabase
      .from('weekends')
      .update(payload)
      .eq('group_id', groupId)
      .eq('type', type)
      .select('*')
      .single()

    if (isSupabaseError(error)) {
      return err(error?.message)
    }

    if (!data) {
      return err(`Failed to update ${type} weekend`)
    }

    return ok(toWeekendWithGroup(data as RawWeekendRecord))
  }

  const mensResult = await applyUpdate(WeekendType.MENS, updates.mens)
  if (isErr(mensResult)) {
    return err(mensResult.error)
  }

  const womensResult = await applyUpdate(WeekendType.WOMENS, updates.womens)
  if (isErr(womensResult)) {
    return err(womensResult.error)
  }

  return getWeekendGroup(groupId)
}

export async function deleteWeekendGroup(
  groupId: string
): Promise<Result<string, { success: boolean }>> {
  if (!groupId) {
    return err('group_id is required to delete a group')
  }

  const supabase = await createClient()

  const { error: weekendDeleteError } = await supabase
    .from('weekends')
    .delete()
    .eq('group_id', groupId)

  if (isSupabaseError(weekendDeleteError)) {
    return err(weekendDeleteError?.message)
  }

  return ok({ success: true })
}

const normalizeSidebarTitle = (title?: string | null) => {
  if (!title) {
    return null
  }

  const trimmed = title.trim()
  return trimmed.length === 0 ? null : trimmed
}

export type WeekendSidebarPayload = {
  groupId?: string | null
  title?: string
  mensStart: string
  mensEnd: string
  womensStart: string
  womensEnd: string
}

export async function saveWeekendGroupFromSidebar(
  payload: WeekendSidebarPayload
): Promise<Result<string, WeekendGroupWithId>> {
  const sharedTitle = normalizeSidebarTitle(payload.title)

  const mensCreate: WeekendWriteInput = {
    start_date: payload.mensStart,
    end_date: payload.mensEnd,
    title: `Mens ${sharedTitle}`,
  }

  const womensCreate: WeekendWriteInput = {
    start_date: payload.womensStart,
    end_date: payload.womensEnd,
    title: `Womens ${sharedTitle}`,
  }

  if (!payload.groupId) {
    const groupId = randomUUID()
    return createWeekendGroup({
      groupId,
      mens: mensCreate,
      womens: womensCreate,
    })
  }

  const mensUpdate: WeekendUpdateInput = {
    start_date: payload.mensStart,
    end_date: payload.mensEnd,
    title: sharedTitle,
  }

  const womensUpdate: WeekendUpdateInput = {
    start_date: payload.womensStart,
    end_date: payload.womensEnd,
    title: sharedTitle,
  }

  const updates: UpdateWeekendGroupInput = {
    mens: mensUpdate,
    womens: womensUpdate,
  }

  return updateWeekendGroup(payload.groupId, updates)
}

/**
 * Fetches a team member's weekend roster record, unless it is already paid for.
 */
export async function getAllWeekends(): Promise<Result<string, Weekend[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*')
    .order('start_date', { ascending: false })

  if (isSupabaseError(error)) {
    return err(error?.message)
  }

  if (!data) {
    return err('No weekends found')
  }

  return ok(data as Weekend[])
}

export async function getWeekendById(
  weekendId: string
): Promise<Result<string, Weekend>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*')
    .eq('id', weekendId)
    .single()

  if (isSupabaseError(error)) {
    return err(error?.message)
  }

  if (!data) {
    return err('Weekend not found')
  }

  return ok(data as Weekend)
}

export type WeekendRosterMember = {
  id: string
  cha_role: string | null
  status: string | null
  weekend_id: string | null
  user_id: string | null
  created_at: string
  rollo: string | null
  users: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone_number: string | null
  } | null
  payment_info: {
    id: string
    payment_amount: number | null
    payment_intent_id: string | null
    payment_method: string | null
  } | null
  // Total amount paid from all payment records
  total_paid: number
  // Array of all payment records for this member
  all_payments: Array<{
    id: string
    payment_amount: number | null
    payment_intent_id: string | null
    payment_method: string | null
    created_at: string
    notes: string | null
  }>
}

export async function getWeekendRoster(
  weekendId: string
): Promise<Result<string, Array<WeekendRosterMember>>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekend_roster')
    .select(
      `
      id,
      cha_role,
      status,
      weekend_id,
      user_id,
      created_at,
      rollo,
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
    )
    .eq('weekend_id', weekendId)
    .order('cha_role', { ascending: true })

  if (isSupabaseError(error)) {
    return err(error?.message)
  }

  if (!data) {
    return err('No roster found for weekend')
  }

  const normalizedWeekendRoster = data.map((weekend_roster) => {
    const all_payments = weekend_roster.weekend_roster_payments ?? []
    const total_paid = all_payments.reduce((sum, payment) => {
      return sum + (payment.payment_amount ?? 0)
    }, 0)

    return {
      ...weekend_roster,
      payment_info: weekend_roster.weekend_roster_payments?.[0] ?? null,
      total_paid,
      all_payments,
    }
  })

  return ok(normalizedWeekendRoster)
}

export async function getAllUsers(): Promise<
  Result<string, Array<Tables<'users'>>>
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('last_name', { ascending: true })

  if (isSupabaseError(error)) {
    return err(error?.message)
  }

  if (!data) {
    return err('No users found')
  }

  return ok(data)
}

export async function addUserToWeekendRoster(
  weekendId: string,
  userId: string,
  role: string,
  rollo?: string
): Promise<Result<string, void>> {
  const supabase = await createClient()

  const { error } = await supabase.from('weekend_roster').insert({
    weekend_id: weekendId,
    user_id: userId,
    status: 'awaiting_payment',
    cha_role: role,
    rollo: rollo ?? null,
  })

  if (isSupabaseError(error)) {
    return err(error?.message)
  }

  return ok(undefined)
}

export async function getWeekendRosterRecord(
  teamUserId: string | null,
  weekendId: string | null
): Promise<Result<string, Tables<'weekend_roster'>>> {
  logger.info(
    `Fetching weekend roster record for team user ID: ${teamUserId} and weekend ID: ${weekendId}`
  )

  if (!teamUserId || !weekendId) {
    return err('💢 Team user ID or weekend ID is null')
  }

  const supabase = await createClient()

  const { data: weekendRosterRecord, error: fetchError } = await supabase
    .from('weekend_roster')
    .select('*')
    .eq('user_id', teamUserId)
    .eq('weekend_id', weekendId)
    .single()

  if (fetchError) {
    return err(fetchError.message)
  }

  if (!weekendRosterRecord) {
    return err('💢 Weekend roster record not found')
  }

  if (weekendRosterRecord.status === 'paid') {
    return err('💢 Weekend roster record is already in status "paid"')
  }

  return ok(weekendRosterRecord)
}

/**
 * Records a manual (cash/check) payment for a weekend roster member
 */
export async function recordManualPayment(
  weekendRosterId: string,
  paymentAmount: number,
  paymentMethod: 'cash' | 'check',
  notes?: string
): Promise<Result<string, Tables<'weekend_roster_payments'>>> {
  const supabase = await createClient()

  // Verify the weekend roster record exists
  const { data: rosterRecord, error: fetchError } = await supabase
    .from('weekend_roster')
    .select('id')
    .eq('id', weekendRosterId)
    .single()

  if (isSupabaseError(fetchError)) {
    return err(`Failed to find roster record: ${fetchError.message}`)
  }

  if (!rosterRecord) {
    return err('Weekend roster record not found')
  }

  // Insert the payment record
  const { data: paymentRecord, error: insertError } = await supabase
    .from('weekend_roster_payments')
    .insert({
      weekend_roster_id: weekendRosterId,
      payment_amount: paymentAmount,
      payment_method: paymentMethod,
      payment_intent_id: `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`, // Generate unique ID for manual payments
      notes: notes ?? null,
      // Note: created_at will be set automatically by Supabase
    })
    .select()
    .single()

  if (isSupabaseError(insertError)) {
    return err(`Failed to record payment: ${insertError.message}`)
  }

  if (!paymentRecord) {
    return err('Failed to record payment')
  }

  logger.info(
    `Manual payment recorded: ${paymentMethod} payment of $${paymentAmount} for roster ID ${weekendRosterId}`
  )

  return ok(paymentRecord)
}

const hasDefinedUpdateValues = (payload: WeekendUpdateInput): boolean => {
  return Object.values(payload).some((value) => value !== undefined)
}

const getWeekendLabel = (weekend: Weekend | null): string => {
  if (isNil(weekend)) {
    return 'Unknown Weekend'
  }

  return trimWeekendTypeFromTitle(formatWeekendTitle(weekend))
}

export async function getWeekendOptions(): Promise<
  Result<string, Array<{ id: string; label: string }>>
> {
  const groupsResult = await getWeekendGroupsByStatus()
  if (isErr(groupsResult)) return err(groupsResult.error)

  const options = groupsResult.data.map((group) => {
    const mens = group.weekends.MENS
    const womens = group.weekends.WOMENS
    // Use mens weekend if available, otherwise womens, otherwise null
    const anyWeekend = mens ?? womens ?? null

    return { id: group.groupId, label: getWeekendLabel(anyWeekend) }
  })

  // Return reversed (newest first)
  return ok(options.reverse())
}
