'use server'

import { isNil } from 'lodash'
import { teamTodoItems } from './todos.config'
import {
  getTodoUrl,
  getCompletionState,
  areAllTodosComplete,
} from './todos.helpers'
import type { TeamMemberUser } from '@/lib/users/types'

export type TeamTodoData = {
  urls: Record<string, string | null>
  completionState: Record<string, boolean>
  allComplete: boolean
  items: typeof teamTodoItems
  groupMemberId: string
}

/**
 * Fetches and prepares team TODO data for display.
 * Server action that handles URL generation and completion checks.
 * Uses groupMemberId (not weekendId) as the storage key since todos are group-scoped.
 */
export async function getTeamTodoData(
  user: TeamMemberUser
): Promise<TeamTodoData | null> {
  const { groupMemberId } = user.teamMemberInfo

  if (isNil(groupMemberId)) {
    return null
  }

  const context = { user }

  const urls: Record<string, string | null> = {}
  for (const item of teamTodoItems) {
    urls[item.id] = getTodoUrl(item, context)
  }

  const completionState = await getCompletionState(teamTodoItems, context)
  const allComplete = areAllTodosComplete(teamTodoItems, completionState)

  return {
    urls,
    completionState,
    allComplete,
    items: teamTodoItems,
    groupMemberId,
  }
}
