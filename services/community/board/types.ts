import type { RoleType } from '@/services/identity/roles'
import type { ContactInfo } from '@/services/notifications'

/**
 * The predefined sort order for board positions.
 * Roles not in this list are not considered board positions.
 */
export const BOARD_ROLE_SORT_ORDER = [
  'President',
  'Vice President',
  'Corresponding Secretary',
  'Recording Secretary',
  'Treasurer',
  'Community Spiritual Director',
  'Pre Weekend Couple',
  'At-Large Members',
]

/**
 * The predefined sort order for committee roles.
 * Roles not in this list not considered committees on the board.
 */
export const BOARD_COMMITTEE_ROLES = ['Leaders Committee']

/**
 * A simplified board role for display purposes.
 */
export type BoardRole = {
  id: string
  label: string
  type: RoleType
  description: string | null
}

/**
 * A simplified member for board assignment purposes.
 */
export type BoardMember = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  roles: Array<{ id: string; label: string }>
}

/**
 * The complete community board data structure.
 * Contains all data needed to render both read-only and editable board views.
 */
export type CommunityBoardData = {
  /** Board positions sorted by predefined order, excluding Leaders Committee */
  boardRoles: BoardRole[]
  /** The Leaders Committee role, if it exists */
  committeeRoles: BoardRole[]
  /** All community members available for assignment */
  members: BoardMember[]
  /** Contact information for the Pre-Weekend Couple */
  preWeekendCoupleContact: ContactInfo
}
