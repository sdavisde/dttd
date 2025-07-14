'use server'

import { createClient } from '@/lib/supabase/server'
import { Tables } from '@/database.types'
import { logger } from '@/lib/logger'
import { Result, err, ok } from '@/lib/results'
import { isErr } from '@/lib/supabase/utils'
import { Weekend } from '@/lib/weekend/types'

export async function getActiveWeekend(): Promise<Result<Error, Weekend>> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('weekends').select('*').eq('status', 'active').single()

  if (isErr(error)) {
    return err(new Error(error?.message))
  }

  if (!data) {
    return err(new Error('No active weekend found'))
  }

  return ok(data)
}

/**
 * Fetches a team member's weekend roster record, unless it is already paid for.
 */
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
