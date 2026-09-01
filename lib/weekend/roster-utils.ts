import { isNil } from 'lodash'
import type { WeekendRosterMember } from '@/services/weekend'
import { CHARole } from './types'

/**
 * Filters roster members by their status
 */
export function filterRosterByStatus(
  roster: Array<WeekendRosterMember>,
  status: string | null
): Array<WeekendRosterMember> {
  return roster.filter((member) => member.status === status)
}

/**
 * Gets active roster members (excludes dropped members)
 */
export function getActiveRoster(
  roster: Array<WeekendRosterMember>
): Array<WeekendRosterMember> {
  return roster.filter((member) => member.status !== 'drop')
}

/**
 * Gets dropped roster members
 */
export function getDroppedRoster(
  roster: Array<WeekendRosterMember>
): Array<WeekendRosterMember> {
  return filterRosterByStatus(roster, 'drop')
}

/**
 * Splits roster into active and dropped members
 */
export function splitRosterByStatus(roster: Array<WeekendRosterMember>) {
  return {
    activeRoster: getActiveRoster(roster),
    droppedRoster: getDroppedRoster(roster),
  }
}

/**
 * Gets roster counts by status
 */
export function getRosterCounts(roster: Array<WeekendRosterMember>) {
  const { activeRoster, droppedRoster } = splitRosterByStatus(roster)

  return {
    active: activeRoster.length,
    dropped: droppedRoster.length,
    total: roster.length,
  }
}

/**
 * Returns the canonical ordering index for a CHA role, matching the order the
 * roles are declared in the CHARole enum. Unknown roles sort just before
 * members with no role at all.
 */
export function getRoleSortOrder(role: string | null | undefined): number {
  if (isNil(role)) return 999
  const index = Object.values(CHARole).indexOf(role as CHARole)
  return index === -1 ? 998 : index
}

/**
 * Sorts roster members by CHA role using the canonical role ordering. Sorting
 * is stable, so members sharing a role keep their incoming order.
 */
export function sortRosterByRole<T extends { cha_role: string | null }>(
  roster: Array<T>
): Array<T> {
  return [...roster].sort(
    (a, b) => getRoleSortOrder(a.cha_role) - getRoleSortOrder(b.cha_role)
  )
}
