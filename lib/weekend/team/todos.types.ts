import { TeamMemberUser } from '@/lib/users/types'
import { Weekend } from '@/lib/weekend/types'

/**
 * Data provided to checkCompletion callbacks for determining TODO completion status.
 * Note: weekendRosterId is available via user.team_member_info.id
 */
export type TodoCompletionContext = {
  user: TeamMemberUser
  weekend: Weekend
}

/**
 * Configuration for a single TODO item in the team preparation list
 */
export type TodoItemConfig = {
  /** Unique identifier for this TODO item */
  id: string
  /** Display text for the TODO item */
  label: string
  /** URL to navigate to, or null if the item is disabled */
  href: string | null
  /** Tooltip text shown when item is disabled */
  tooltip?: string
  /** Function to generate URL parameters if needed */
  params?: (context: TodoCompletionContext) => string
  /** Optional callback to check if this TODO is complete */
  checkCompletion?: (
    context: TodoCompletionContext
  ) => Promise<boolean> | boolean
}

/**
 * Completion state for all TODO items, keyed by TODO id
 */
export type TodoCompletionState = Record<string, boolean>
