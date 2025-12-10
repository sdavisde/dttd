import 'server-only'
import { isNil } from 'lodash'
import { getWeekendById } from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { teamTodoItems } from './todos.config'
import {
  getTodoUrl,
  getCompletionState,
  areAllTodosComplete,
} from './todos.helpers'
import { TeamMemberUser } from '@/lib/users/types'

export type TeamTodoData = {
  urls: Record<string, string | null>
  completionState: Record<string, boolean>
  allComplete: boolean
  items: typeof teamTodoItems
}

/**
 * Fetches and prepares team TODO data for display.
 * Server action that handles weekend lookup, URL generation, and completion checks.
 */
export async function getTeamTodoData(
  user: TeamMemberUser
): Promise<TeamTodoData | null> {
  const weekendId = user.team_member_info.weekend_id

  if (isNil(weekendId)) {
    return null
  }

  const weekendResult = await getWeekendById(weekendId)

  if (isErr(weekendResult)) {
    return null
  }

  const weekend = weekendResult.data
  const context = { user, weekend }

  // Pre-compute URLs for each TODO item
  const urls: Record<string, string | null> = {}
  for (const item of teamTodoItems) {
    urls[item.id] = getTodoUrl(item, context)
  }

  // Get completion state for all items
  const completionState = await getCompletionState(teamTodoItems, context)
  const allComplete = areAllTodosComplete(teamTodoItems, completionState)

  return {
    urls,
    completionState,
    allComplete,
    items: teamTodoItems,
  }
}
