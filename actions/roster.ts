'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveWeekends } from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { Result, err, ok } from '@/lib/results'

/**
 * Checks if the current user is serving as RECTOR on the upcoming weekend
 * that matches their gender
 */
export async function isUserRectorOnUpcomingWeekend(): Promise<Result<Error, boolean>> {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return ok(false)
  }

  // Get user details including gender
  const { data: userDetails, error: userDetailsError } = await supabase
    .from('users')
    .select('gender')
    .eq('id', user.id)
    .single()

  if (userDetailsError || !userDetails?.gender) {
    return ok(false)
  }

  // Get active weekends
  const activeWeekendsResult = await getActiveWeekends()
  if (isErr(activeWeekendsResult)) {
    return err(activeWeekendsResult.error)
  }

  // Get the upcoming weekend that matches user's gender
  const upcomingWeekend = activeWeekendsResult.data[userDetails.gender as 'MENS' | 'WOMENS']
  
  if (!upcomingWeekend) {
    return ok(false)
  }

  // Check if user is serving as RECTOR on this weekend
  const { data: rectorCheck, error: rectorError } = await supabase
    .from('weekend_roster')
    .select('id')
    .eq('weekend_id', upcomingWeekend.id)
    .eq('user_id', user.id)
    .eq('cha_role', 'Rector')
    .single()

  if (rectorError) {
    return ok(false)
  }

  return ok(!!rectorCheck)
}