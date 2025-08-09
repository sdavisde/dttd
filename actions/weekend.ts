'use server'

import { createClient } from '@/lib/supabase/server'
import { Tables } from '@/database.types'
import { logger } from '@/lib/logger'
import { Result, err, ok } from '@/lib/results'
import { isSupabaseError } from '@/lib/supabase/utils'
import { Weekend, WeekendType } from '@/lib/weekend/types'

export async function getActiveWeekends(): Promise<
  Result<Error, Record<WeekendType, Weekend | null>>
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*')
    .eq('status', 'ACTIVE')

  if (isSupabaseError(error)) {
    return err(new Error(error?.message))
  }

  if (!data) {
    return err(new Error('No active weekend found'))
  }

  return ok({
    MENS: data.find((weekend) => weekend.type === 'MENS') ?? null,
    WOMENS: data.find((weekend) => weekend.type === 'WOMENS') ?? null,
  })
}

/**
 * Fetches a team member's weekend roster record, unless it is already paid for.
 */
export async function getAllWeekends(): Promise<Result<Error, Weekend[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*')
    .order('start_date', { ascending: false })

  if (isSupabaseError(error)) {
    return err(new Error(error?.message))
  }

  if (!data) {
    return err(new Error('No weekends found'))
  }

  return ok(data as Weekend[])
}

export async function getWeekendById(
  weekendId: string
): Promise<Result<Error, Weekend>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*')
    .eq('id', weekendId)
    .single()

  if (isSupabaseError(error)) {
    return err(new Error(error?.message))
  }

  if (!data) {
    return err(new Error('Weekend not found'))
  }

  return ok(data as Weekend)
}

export async function getWeekendRoster(weekendId: string): Promise<
  Result<
    Error,
    Array<{
      id: string
      cha_role: string | null
      status: string | null
      weekend_id: string | null
      user_id: string | null
      created_at: string
      users: {
        id: string
        first_name: string | null
        last_name: string | null
        email: string | null
        phone_number: string | null
      } | null
    }>
  >
> {
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
      users (
        id,
        first_name,
        last_name,
        email,
        phone_number
      )
    `
    )
    .eq('weekend_id', weekendId)
    .order('cha_role', { ascending: true })

  if (isSupabaseError(error)) {
    return err(new Error(error?.message))
  }

  if (!data) {
    return err(new Error('No roster found for weekend'))
  }

  return ok(data)
}

export async function getAllUsers(): Promise<
  Result<Error, Array<Tables<'users'>>>
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('last_name', { ascending: true })

  if (isSupabaseError(error)) {
    return err(new Error(error?.message))
  }

  if (!data) {
    return err(new Error('No users found'))
  }

  return ok(data)
}

export async function addUserToWeekendRoster(
  weekendId: string,
  userId: string,
  role: string
): Promise<Result<Error, void>> {
  const supabase = await createClient()

  const { error } = await supabase.from('weekend_roster').insert({
    weekend_id: weekendId,
    user_id: userId,
    status: 'awaiting_payment',
    cha_role: role,
  })

  if (isSupabaseError(error)) {
    return err(new Error(error?.message))
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
