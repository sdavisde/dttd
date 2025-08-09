'use server'

import { createClient } from '@/lib/supabase/server'
import { Tables } from '@/database.types'
import { logger } from '@/lib/logger'
import { Result, err, ok } from '@/lib/results'
import { isSupabaseError } from '@/lib/supabase/utils'
import { Weekend, WeekendType } from '@/lib/weekend/types'

export async function getActiveWeekends(): Promise<Result<Error, Record<WeekendType, Weekend | null>>> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('weekends').select('*').eq('status', 'active')

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

export async function getWeekendRosterRecord(
  teamUserId: string | null,
  weekendId: string | null
): Promise<Result<string, Tables<'weekend_roster'>>> {
  logger.info(`Fetching weekend roster record for team user ID: ${teamUserId} and weekend ID: ${weekendId}`)

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
