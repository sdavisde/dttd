'use server'

import { createClient } from '@/lib/supabase/server'
import { Result, ok } from '@/lib/results'
import { isNil } from 'lodash'

/**
 * Checks if the current user is serving as RECTOR on any active weekend.
 * Queries via weekend_group_members → weekend_groups → weekends → weekend_roster,
 * so cross-weekend volunteers are correctly detected as Rector on any active weekend
 * without relying on gender inference.
 */
export async function isUserRectorOnUpcomingWeekend(): Promise<
  Result<string, boolean>
> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return ok(false)
  }

  // Find the active group for this user (via weekend_group_members → weekend_groups → weekends)
  const { data: activeWeekends } = await supabase
    .from('weekends')
    .select('id, group_id')
    .eq('status', 'ACTIVE')

  if (!activeWeekends?.length) {
    return ok(false)
  }

  const activeGroupIds = [
    ...new Set(
      activeWeekends.map((w) => w.group_id).filter((id) => !isNil(id))
    ),
  ]

  // Check if user has a group_member row in any active group
  const { data: groupMember } = await supabase
    .from('weekend_group_members')
    .select('id')
    .eq('user_id', user.id)
    .in('group_id', activeGroupIds)
    .maybeSingle()

  if (isNil(groupMember)) {
    return ok(false)
  }

  // Check if the user has cha_role = 'Rector' on any of the active weekend roster rows
  const activeWeekendIds = activeWeekends.map((w) => w.id)

  const { data: rectorCheck } = await supabase
    .from('weekend_roster')
    .select('id')
    .eq('user_id', user.id)
    .in('weekend_id', activeWeekendIds)
    .eq('cha_role', 'Rector')
    .maybeSingle()

  return ok(!!rectorCheck)
}
